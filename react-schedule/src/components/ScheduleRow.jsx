var React = require('react');

var ScheduleRow = React.createClass({
	render() {
		let body = [];
		for (let i = 0; i < 24; i++) {
			let isActive = this.props.activeCells[i] ? 'active' : 'inactive';
			body.push(<td data-key={this.props.dayWeek + '-' + i} key={this.props.dayWeek + i} className={"schedule-cell " + isActive}></td>);
		}
		let allDayClass = this.props.activeCells.every(e => e === 1) ? 'all-active' : 'all-inactive';
		body.unshift(<td data-key={this.props.dayWeek + '-all'} key="allDays" className={allDayClass}></td>);
		body.unshift(<td key={this.props.dayWeek + 'Header'}>{this.props.dayWeek}</td>); // allDayPicker
		return (
			<tr className="schedule-row" >
				{body}
			</tr>
		);
	}
});

module.exports = ScheduleRow;