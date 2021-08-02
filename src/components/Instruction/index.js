import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import Service from "../../eth/common";
import AlertDialog from "../dialog";

var service;
// define operation
class Opt {
  static sceneSubmit = 'submit'
  static sceneTips = 'tips'
  static submitCancel = 'cancel'
  static submitConfirm = 'confirm'
  static stepCommit = 0;
  static stepReveal = 1;
  static stepWinner = 2;
}
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "25ch",
  },
}));
const candidateOpt = [
  {
    value: "YES",
    label: "YES",
  },
  {
    value: "NO",
    label: "NO",
  },
];

function getSteps() {
  return ["Commit", "Reveal", "Winner"];
}

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case Opt.stepCommit:
      return "Commit vote by password";
    case Opt.stepReveal:
      return "Reveal Vote by password";
    case Opt.stepWinner:
      return "View Winner";
    default:
      return "Unknown stepIndex";
  }
}
function getSubmitContent(stepIndex) {
  switch (stepIndex) {
    case Opt.stepCommit:
      return "Commit";
    case Opt.stepReveal:
      return "Reveal";
    case Opt.stepWinner:
      return "Winner";
    default:
      return "Unknown stepIndex";
  }
}

export default function Instruction() {
  const classes = useStyles();
  // just split state into different scene. ff necessary , we can compose their together
  const [activeStep, setActiveStep] = React.useState(0);
  const [endTime, setEndTime] = React.useState('2021');
  const [candidate, setCandidate] = React.useState("YES");
  const [dialog, setDialog] = React.useState({
    title: "",
    msg: "",
    open: false,
  });
  const inputPwdRef = React.useRef();
  const selectCandidateRef = React.useRef();
  const steps = getSteps();

  React.useEffect(() => {
    if (service) {
      return;
    }
    service = new Service();
    service
      .init()
      .then(
        (t) => {
          console.log(`service1 ${t} `)
          let showTime = new Date(t * 1000).toLocaleString('en-US')
          console.log(showTime);
          setEndTime(showTime)
        }
      )
      .catch((e) => {
        console.log(`init fail ${e}`);
        handleCustomDialog(Opt.sceneTips, { msg: 'Metamask connect fail', title: 'Init' })
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = async () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleSubmit = () => {
    console.log(
      `current step: ${activeStep}, ${inputPwdRef.current.value}, ${selectCandidateRef.current.value}`
    );
    handleCustomDialog(Opt.sceneSubmit);
  };

  const handleCustomDialog = (scene, customInfo) => {
    if (Opt.sceneSubmit === scene) {
      // confirm before submit, ignore customInfo
      let info;
      switch (activeStep) {
        case Opt.stepCommit:
          info = {
            msg: `make sure vote process is begin.`,
            title: "Commit",
            open: true,
          };
          break;
        case Opt.stepReveal:
          info = {
            msg: "make sure you have finished commit",
            title: "Reveal",
            open: true,
          };
          break;
        case Opt.stepWinner:
          info = {
            msg: `make sure you have finished reveal and the vote process is over`,
            title: "Winner",
            open: true,
          };
          break;
        default:
          console.log(`current step: ${activeStep}`);
      }
      info.scene = scene
      setDialog(info);
    } else {
      customInfo.open = true;
      customInfo.scene = scene;
      setDialog(customInfo);
    }
  };
  const handleCloseDialog = (scene, opt) => {
    setDialog({ open: false });
    console.log('handleCloseDialog', scene, opt)
    if (Opt.sceneSubmit !== scene) {//current scene no need submit, just return
      return;
    }
    if (Opt.submitCancel === opt) {// when in submit scene, but use cancel it.
      return;
    }
    // submit business
    let pwd = inputPwdRef.current.value;
    let selectedVal = selectCandidateRef.current.value;
    switch (activeStep) {
      case Opt.stepCommit:
        if (pwd === '') {
          handleCustomDialog(Opt.sceneTips, { msg: `Pls input pwd`, title: 'Fail' })
          return;
        }
        service.commitVote(selectedVal, pwd, (result) => {
          console.log("result:", result);
          if (result.code === 0) {
            handleCustomDialog(Opt.sceneTips, { msg: 'Commit vote success', title: 'Success' })
          } else {
            handleCustomDialog(Opt.sceneTips, { msg: `${result.msg}`, title: 'Fail' })
          }
        });
        break;
      case Opt.stepReveal:
        if (pwd === '') {
          handleCustomDialog(Opt.sceneTips, { msg: `Pls input pwd`, title: 'Fail' })
          return;
        }
        service.revealVote(selectedVal, pwd, (result) => {
          console.log("result:", result);
          if (result.code === 0) {
            handleCustomDialog(Opt.sceneTips, { msg: 'Reveal vote success', title: 'Success' })
          } else {
            handleCustomDialog(Opt.sceneTips, { msg: `${result.msg}`, title: 'Fail' })
          }
        });
        break;
      case Opt.stepWinner:
        service
          .getWinner()
          .then((result) => {
            console.log(`winner is : ${result}`);
            handleCustomDialog(Opt.sceneTips, { msg: `Winner: ${result}`, title: 'Success' })
          })
          .catch((e) => {
            handleCustomDialog(Opt.sceneTips, { msg: `${e}`, title: 'Fail' })
          });

        break;
      default:
        console.log(`current step: ${activeStep}`);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleChange = (event) => {
    setCandidate(event.target.value);
  };
  return (
    <div className={classes.root}>
      <AlertDialog
        open={dialog.open}
        msg={dialog.msg}
        title={dialog.title}
        scene={dialog.scene}
        onClose={handleCloseDialog}
      ></AlertDialog>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div className={classes.instructions}>
            <Typography>All steps completed</Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div className={classes.instructions}>
            <Typography>{`Deadline: ${endTime}`}</Typography>
            <Typography>{getStepContent(activeStep)} </Typography>
            <div>
              <TextField
                id="select-candidate"
                select
                label="Candidate"
                inputRef={selectCandidateRef}
                margin="dense"
                value={candidate}
                onChange={handleChange}
                variant="outlined"
              >
                {candidateOpt.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                id="vote_password"
                label="Password"
                inputRef={inputPwdRef}
                style={{ margin: 8 }}
                placeholder=""
                helperText=""
                margin="dense"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
              />
            </div>

            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                className={classes.backButton}
              >
                {getSubmitContent(activeStep)}
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext}>
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
