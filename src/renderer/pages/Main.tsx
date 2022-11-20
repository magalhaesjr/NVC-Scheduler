/* eslint-disable jsx-a11y/label-has-associated-control */
// Footer for main page
import Box from '@mui/material/Box';
import ScheduleForm from '../components/schedule-form';
/*
import Typography from '@mui/material/Typography';
import {
  assignTeamNumbers,
  buildScheduleTable,
  importTeamInfo,
  initByeRequestTable,
  nextStep,
  updateCalendarPreview,
} from '../scheduler';
const d = new Date();
*/
import './Main.css';

const Main = () => {
  return (
    <Box width="100%" height="100%">
      <ScheduleForm />
      {/*
      <Typography variant="h1">NVC Scheduler</Typography>
        <Box id="formDiv" className="formPanel" sx={{ display: 'none' }}>
          <input
            id="one"
            type="radio"
            name="stage"
            defaultChecked
            onClick={() => setChecked('one')}
          />
          <input
            id="two"
            type="radio"
            name="stage"
            onClick={() => setChecked('two')}
          />
          <input
            id="three"
            type="radio"
            name="stage"
            onClick={() => setChecked('three')}
          />
          <input
            id="four"
            type="radio"
            name="stage"
            onClick={() => setChecked('four')}
          />
          <input
            id="five"
            type="radio"
            name="stage"
            onClick={() => setChecked('five')}
          />

          <Box className="stages" sx={{ display: 'none' }}>
            <label htmlFor="#one">1</label>
            <label htmlFor="two">2</label>
            <label htmlFor="three">3</label>
            <label htmlFor="four">4</label>
            <label htmlFor="five">5</label>
          </Box>
          <span className="progress" />
          <Box alignItems="center">
            <button
              className="transitionbutton"
              id="nextButton"
              type="button"
              form="scheduleForm"
              onClick={nextStep}
            >
              <span>Next</span>
            </button>
          </Box>

          <div className="panels">
            <div className="stepPanel" id="form_step_1" data-panel="one" />
            <div className="stepPanel" id="form_step_2" data-panel="two">
              <Typography variant="h2" text-align="center">
                Schedule Information
              </Typography>
              <label htmlFor="start_date">Start Date</label>
              <input
                type="date"
                id="start_date"
                value={d.toDateString()}
                onChange={() => {
                  buildScheduleTable();
                  initByeRequestTable();
                  updateCalendarPreview();
                }}
              />
              <label htmlFor="start_court">First Court Number</label>
              <input
                type="number"
                id="start_court"
                min={1}
                max={24}
                value={1}
                onChange={() => {
                  buildScheduleTable();
                  initByeRequestTable();
                }}
              />
              <Typography variant="h2" id="scheduleName" text-align="center" />
              <div className="scheduleTable" id="schedule_preview" />
              <div className="scheduleCalendar" id="schedule_date_preview" />
            </div>
            <div className="stepPanel" id="form_step_3" data-panel="three">
              <Typography variant="h2" text-align="center">
                Team Information
              </Typography>
              <table id="teamInfoTable">
                <thead>
                  <tr>
                    <td>Team Number</td>
                    <td>Team Name</td>
                    <td>Mapping Code</td>
                  </tr>
                </thead>
                <tbody id="teamInfoBody" />
              </table>
              <Box display="block">
                <button
                  className="pushbutton"
                  type="button"
                  id="importTeamBtn"
                  onClick={importTeamInfo}
                >
                  Import
                </button>
              </Box>
            </div>
            <div className="stepPanel" id="form_step_4" data-panel="four">
              <Typography variant="h2" text-align="center">
                Bye Requests
              </Typography>
              <Box id="teamPanel" display="block">
                <table id="teamTable">
                  <thead>
                    <tr>
                      <td>Team #</td>
                      <td>Team Name</td>
                    </tr>
                  </thead>
                  <tbody id="teamTableBody" />
                </table>
              </Box>
              <div id="byePanel">
                <table id="byeRequestTable">
                  <thead id="byeRequestHeader" />
                  <tbody id="byeRequestBody" />
                </table>
                <button
                  className="pushbutton"
                  type="button"
                  id="assignTeamNumBtn"
                  onClick={assignTeamNumbers}
                >
                  Assign Team Numbers
                </button>
              </div>
            </div>
            <div className="stepPanel" id="form_step_5" data-panel="five">
              <Typography variant="h2" text-align="center">
                Final Preview
              </Typography>
              <div className="scheduleTable" id="scheduleReviewTable" />
              <div id="scheduleReviewCalendar" className="scheduleCalendar" />
              <div id="scheduleNightPreview" />
            </div>
          </div>
        </Box>
            */}
    </Box>
  );
};

export default Main;
