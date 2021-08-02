import Web3 from "web3";
import CommitReveal from "../abis/CommitReveal.json";
import { Keccak } from "sha3";

export default class CommitRevealService {
  constructor() {
    console.log("CommitRevealService init");
  }
  // candidate NO 1
  static ChoiceNO1 = "YES";
  // candidate NO 2
  static ChoiceNO2 = "NO";
  // init ethereum, connect to metamask
  init = async () => {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      await this.loadAccount();
      return await this.loadBlockchainData();
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
      await this.loadAccount();
      return await this.loadBlockchainData();
    } else {
      return Promise.reject(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };
  // Get first account from metamask, used for sending transaction when voting.
  loadAccount = async () => {
    let accounts = await this.web3.eth.getAccounts()
    this.voter = accounts[0];
    console.log("account init success: ", this.voter);
  };

  // Load CommitReveal contact
  loadBlockchainData = async () => {
    const networkId = await this.web3.eth.net.getId();
    const CommitRevealData = CommitReveal.networks[networkId];
    if (CommitRevealData) {
      this.commitContract = new this.web3.eth.Contract(
        CommitReveal.abi,
        CommitRevealData.address
      );
      console.log("contract init success");
      return await this.getCommitPhaseEndTime()
    }
  };

  // commit vote.
  commitVote = (candidate, password, fn) => {
    // check if CommitReveal is loaded
    if (this.commitContract === undefined) {
      fn({code:-1, msg: `Commit contract doesn't init`});
      return;
    }
    console.log(
      `${this} candidate is ${candidate}, voter: ${this.voter} ${CommitRevealService.ChoiceNO1} ${CommitRevealService.ChoiceNO2}`
    );
    let commitInfo = this.computerVoteCommit(candidate, password);
    let that = this
    this.commitContract.methods
      .commitVote(commitInfo)
      .send({ from: this.voter })
      .on("transactionHash", function (hash) {
        console.log("transactionHash: ", hash);
        fn({code:0, data:hash});
      })
      .on("error", function (error) {
        fn({code:-1, msg: that.parseError(error.message)})
      });
  };

  // reveal vote
  revealVote = (candidate, password, fn) => {
    // check if CommitReveal is loaded
    if (this.commitContract === undefined) {
      fn({code:-1, msg: `Commit contract doesn't init`});
      return;
    }
    let that = this;
    let commitInfo = this.computerVoteCommit(candidate, password);
    let voteInfo = this.computerVote(candidate, password);
    this.commitContract.methods
      .revealVote(voteInfo, commitInfo)
      .send({ from: this.voter })
      .on("transactionHash", function (hash) {
        fn({code:0 , data: hash, msg:'success'});
      })
      .on("error", function (error) {
        fn({code: -1,  msg: that.parseError(error.message)});
      })
  };
  // Get winner
  getWinner = async () => {
    // check if CommitReveal is loaded
    if (this.commitContract === undefined) {
      return Promise.reject("Commit contract doesn't init");
    }
    try{
      let winner = await this.commitContract.methods.getWinner().call();
      return Promise.resolve(winner);
    } catch(error){
      return Promise.reject(this.parseError(error.message));
    }
  };

  // parse evm revert error
  parseError = (str)=>{
    // let beginPos = str.indexOf("revert");
	  // let endPos = str.indexOf('}', beginPos);
    // // beginPos+6: remove revert, endPos-1 : remove ";
	  // return str.substring(beginPos+6, endPos-2);
    return str;
  }
  // Get commit end time
  getCommitPhaseEndTime= async()=>{
    if (this.commitContract === undefined) {
      return Promise.reject("Commit contract doesn't init");
    }
    try{
      let endTime = await this.commitContract.methods.commitPhaseEndTime().call();
      return Promise.resolve(endTime);
    } catch(error){
      return Promise.reject(this.parseError(error.message));
    }
  }
  // computer vote
  computerVote = (candidate, password) => {
    let content;
    if (candidate === CommitRevealService.ChoiceNO1) {
      content = `1-${password}`;
    } else if (candidate === CommitRevealService.ChoiceNO2) {
      content = `2-${password}`;
    } else {
      throw new Error(`${candidate} is illegal option`);
    }
    console.log(`current vote is: ${content} `);
    return content;
  };

  // computer vote commit
  computerVoteCommit = (candidate, password) => {
    let content = this.computerVote(candidate, password);
    const hash = new Keccak(256);
    hash.update(content);
    return `0x` + hash.digest("hex");
  };


}
