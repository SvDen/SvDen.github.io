var React = require('react');
var ScheduleRow = require('./ScheduleRow.jsx');

var Schedule = React.createClass({
	getInitialState() {
		let emptyArr = '0'.repeat(24).split('').map(e => +e);
		return {
			scheduleData: {
				"mo": emptyArr.slice(),
				"tu": emptyArr.slice(),
				"we": emptyArr.slice(),
				"th": emptyArr.slice(),
				"fr": emptyArr.slice(),
				"sa": emptyArr.slice(),
				"su": emptyArr.slice()
			},
			mouseDown: false // 0 если маусдаун был на светлом, 1 - на тёмном, false - не было
		}
	},

	loadFromStorage() {
		let gotData = localStorage.getItem('react-schedule');
		if (!gotData) return false;

		try {
			gotData = JSON.parse(gotData);
		} catch (e) {
			console.warn('Wrong data in localstorage. Expected stringified object.');
			return false;
		}

		let newData = {};

		for (let key in gotData) {
			let weekDay = gotData[key];
			let activeCells = [];
			for (let i = 0; i < 24; i++) {
				activeCells[i] = 0;
				let minTime = i * 60;
				weekDay.forEach(e => {
					if (minTime >= e.bt && minTime < e.et) activeCells[i] = 1
				});
			}
			newData[key] = activeCells;
		}
		return newData;
	},

	saveToStorage() {
		let data = this.state.scheduleData,
			savingObj = {};

		for (let key in data) {
			let weekDay = data[key];
			let periods = [];

			let start = null;

			for (let i = 0; i < weekDay.length; i++) {
				let cell = weekDay[i];
				if (cell === 1) {
					if (start === null) start = i * 60;
				} else {
					if (start !== null) {
						periods.push({
							bt: start,
							et: i * 60 - 1
						});
						start = null
					}
				}
			}

			if (start !== null) {
				periods.push({
					bt: start,
					et: weekDay.length * 60 - 1
				})
			}

			savingObj[key] = periods;
		}

		localStorage.setItem('react-schedule', JSON.stringify(savingObj))
	},

	componentWillMount() {
		// тут мы получим данные с сервера и обработаем их
		let newData = this.loadFromStorage();

		// после чего сохраняем новый стейт
		if (newData) this.setState({scheduleData: newData})
	},

	onClickHandler(e) {
		let key = e.target.dataset.key;
		if (!key) return;
		let data = this.state.scheduleData;
		let dayWeek = key.slice(0, 2).toLowerCase(),
			cell = key.slice(3);

		if (cell === 'all') {
			if (this.state.mouseDown === 0) data[dayWeek] = data[dayWeek].map(e => 0);
			else if (this.state.mouseDown === 1) data[dayWeek] = data[dayWeek].map(e => 1);
			else {
				if (data[dayWeek].every(e => e === 1)) data[dayWeek] = data[dayWeek].map(e => 0);
				else data[dayWeek] = data[dayWeek].map(e => 1);
			}
		} else {
			if (this.state.mouseDown === 0) data[dayWeek][cell] = 0;
			else if (this.state.mouseDown === 1) data[dayWeek][cell] = 1;
			else data[dayWeek][cell] === 1 ? data[dayWeek][cell] = 0 : data[dayWeek][cell] = 1;
		}

		this.setState({scheduleData: data});
	},

	onMouseOverHandler(e) {
		if (e.buttons && this.state.mouseDown !== false) this.onClickHandler(e);
	},

	onMouseDownHandler(e) {
		let key = e.target.dataset.key;
		if (!key) return;

		this.onClickHandler(e);

		let data = this.state.scheduleData;
		let dayWeek = key.slice(0, 2).toLowerCase(),
			cell = key.slice(3);
		if (cell !== 'all') {
			this.setState({mouseDown: +data[dayWeek][cell]})
		}
		else {
			if (data[dayWeek].every(e => e === 1)) this.setState({mouseDown: 1});
			else this.setState({mouseDown: 0});
		}

		e.preventDefault();
	},

	onMouseUpHandler() {
		this.setState({mouseDown: false});
	},

	onClearClickHandler() {
		let data = this.state.scheduleData;
		for (let key in data) {
			data[key] = data[key].map(e => 0);
		}
		this.setState({scheduleData: data});
	},

	render() {
		let headers = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].map(e => <th colSpan="3"
		                                                                                                    key={e}>{e}</th>);

		let underHeader = [];
		for (let i = 0; i < headers.length; i++) {
			underHeader.push(<th key={'underH' + i} colSpan="3" className="under-header"></th>)
		}
		let underHeaderStyles = {
			border: '1px 0 0 0',
			borderWidth: '1px'
		};

		headers.unshift(<th key='ALL DAY' className="schedule-allDayPicker" rowSpan="2">ALL DAY</th>);
		headers.unshift(<th key='emptyHeader' rowSpan="2"></th>);


		let dayWeeks = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
		let body = dayWeeks.map((e, ind) => <ScheduleRow
			key={e}
			dayWeek={e}
			data-key={ind}
			activeCells={this.state.scheduleData[dayWeeks[ind].toLowerCase()]}
		/>);

		return (
			<div className="schedule">
				<table onMouseDown={this.onMouseDownHandler}
				       onMouseUp={this.onMouseUpHandler}
				       onMouseOver={this.onMouseOverHandler}>
					<tbody>
					<tr>{headers}</tr>
					<tr style={underHeaderStyles}>{underHeader}</tr>
					{body}
					</tbody>
				</table>
				<div className="schedule-button-container">
					<button onClick={this.onClearClickHandler}>Clear</button>
					<button onClick={this.saveToStorage}>Save</button>
				</div>
			</div>
		);
	}
});

module.exports = Schedule;