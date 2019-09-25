import React from 'react';
import autoBind from 'react-autobind';
import * as d3 from "d3";
import ReactCountdownClock from 'react-countdown-clock';
import { t } from '../../locales';
import Context from '../../library/Context';

let xwidth, xheight, svg, x, y, xAxis, yAxis;
class ContDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            counter: 1.00
        };
    }
    num(num) {
        this.setState({ counter: num })
    }
    render() {
        let dur = 10 - this.state.counter;
        dur = dur < 3 ? 3 : dur;
        let font = 150 + this.state.counter * 15
        font = font < 300 ? font : 300;
        return (
            <div
                style={{
                    animationDuration: dur + 's',
                    fontSize: font + '%'
                }}
                className={"crash shake-slow "} >
                {this.state.counter} x

            </div>
        );
    }
}

class Chart extends React.Component {
    static contextType = Context;
    constructor(props, context) {
        super(props);
        this.state = {
            ...context.state,
            counting: null
        }
        this.first = true;
        this.Counter = null;
        this.isChart = null;
        this.count = 0;
        this.time = 0;
        this.axis = [];

        autoBind(this);
    }

    componentWillReceiveProps(any, nextProps) {
        if (nextProps.state.started != this.state.started) {
            if (nextProps.state.started == true) {
                this.Counter = null;
                this.time = 0;
                this.axis = [{ y: 1.0, x: 0 }];
                this.cashing = 1;
                this.isChart = null;
                this.setState({ counting: false, crashed: false }, () => {
                    this.initChart();
                });
            } else {
                this.setState({ crashed: true })
            }
        }
        this.setState(nextProps.state)
    }

    countDown(timer) {
        this.first = false;
        this.setState({ counting: timer })
    }
    componentDidMount() {
        xwidth = document.querySelector(".pchart").clientWidth;
        xheight = document.querySelector(".pchart").clientHeight;

        this.context.game.register('timer', this.countDown);
        this.context.game.register('c', this.calculate);

        this.point = this.context.app('point');

    }
    calculate(cashing) {
        this.cashing = cashing;
        this.time += 100;

        this.axis.push({
            y: parseFloat(cashing),
            x: this.time / 1000,
        })

        if (this.Counter != null)
            this.Counter.num(cashing);
        if (this.isChart && this.context.state.isFocus)
            this.draw(this.axis);
    }
    initChart() {

        let margin = { top: 10, right: 10, bottom: 30, left: 30 },
            width = xwidth - margin.right - margin.left - 20,
            height = xheight - margin.top - margin.bottom - 50;
        svg = d3.select(".js-report-sparkline")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        x = d3.scaleLinear().range([0, width]);
        xAxis = d3.axisBottom().scale(x)//.tickFormat((d, i) => {
        //     return i / 10
        // });
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x-axis");

        y = d3.scaleLinear().range([height, 0]);

        yAxis = d3.axisLeft().scale(y)//.tickFormat((d, i) => { //tick custom
        //     return 1 + i / 10
        // });
        svg.append("g")
            .attr("class", "y-axis")

        let colorRange = ['#ff3d77', '#338aff']

        let color = d3.scaleLinear().range(colorRange).domain([0, 1]);

        let linearGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "linear-gradient");

        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", color(0));

        linearGradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", color(1));
        this.isChart = true;
    }
    draw(data) {
        let a = d3.max(data, function (d) { return d.x });
        x.domain([0, a < 5 ? 5 : a])

        svg.selectAll(".x-axis")
            .transition()
            .duration(20)
            .call(xAxis);

        let b = d3.max(data, function (d) { return d.y });
        y.domain([1, b < 2 ? 2 : b])
        svg.selectAll(".y-axis")
            .transition()
            .duration(20)
            .call(yAxis);

        let newData = [data[data.length - 1]]
        let mm = svg.selectAll('circle')
            .data(newData)
        mm
            .enter()
            .append('circle')
            .merge(mm)
            .attr('r', 7.0)
            .attr('cx', function (d) { return x(d.x); })
            .attr('cy', function (d) { return y(d.y); })
            .style('cursor', 'pointer')
            .style('fill', '#338aff');


        let u = svg.selectAll(".lineTest")
            .data([data], function (d) { return d.x });

        u
            .enter()
            .append("path")
            .attr("class", "lineTest")
            .merge(u)
            .transition()
            .duration(100)
            .attr("d", d3.line().curve(d3.curveBasisOpen)
                .x(function (d) { return x(d.x); })
                .y(function (d) { return y(d.y); }))
            .attr("stroke-width", 3)
            .attr("stroke", "url(#linear-gradient)")
            .attr("fill", "none");



    }
    rendHistory() {
        let history = [], i;
        let len = this.context.state.history.length > 6 ? 6 : this.context.state.history.length;
        for (i = 0; i < len; i++)
            history.push(this.context.state.history[i]);

        return (
            <div className="row point" >
                {history.map(item => {
                    return (
                        <div key={item.id} className="col" onClick={() => this.point.show(item.id)} style={{ color: item.point < 2 ? 'rgb(248, 14, 121)' : 'rgb(57, 189, 151)' }} >
                            {item.point}x
                        </div>
                    )
                })}
            </div>
        )
    }

    render() {
        let circle = xwidth / 2 - 30;
        circle = circle > 180 ? 180 : circle;
        if (this.state.started == true || (!this.first && !this.state.counting))
            return (
                <div className="chart" >
                    <div className="js-report-sparkline"></div>
                    {this.rendHistory()}
                    {(this.state.crashed && this.cashing != undefined)
                        ? <div className={'crash crashed'} >{t('crashedAt').replace('#', this.cashing)}</div>
                        : <ContDown ref={r => this.Counter = r} />
                    }
                </div >
            );
        if (this.state.counting) {
            return (
                <div className="chart" >
                    <ReactCountdownClock seconds={this.state.counting}
                        color="#fff"
                        alpha={0.9}
                        weight={5}
                        size={circle}
                        onComplete={() => null} />
                    {this.rendHistory()}
                </div>
            )
        }
        else if (this.first)
            return (
                <div className="chart" >
                    <h2 className="loading">{t('connection')}</h2>
                </div>
            )

    }
}

export default Chart;