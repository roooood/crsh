import React from 'react';
import * as F from '../library/Helper';
import { t } from '../locales';
import Context from '../library/Context';
import CountUp from 'react-countup';

class Info extends React.Component {
    static contextType = Context;
    constructor(props, context) {
        super(props);
        this.state = {
            start: 0,
            end: 'balance' in context.state ? context.state.balance : 0
        };
        this.back = F.getQuery('ref');
    }
    componentWillReceiveProps(any, nextProps) {
        if ('balance' in nextProps.state) {
            if (nextProps.state.balance != this.state.end) {
                this.setState({
                    start: this.state.end,
                    end: nextProps.state.balance
                })
            }
        }
    }
    render() {
        return (
            <div className="info" >
                <div className="row" >
                    <div className="col">
                        <div className="statistic">
                            <div className="value" style={{ color: 'rgb(116, 198, 92)', fontSize: '2rem', margin: 10 }}>
                                {this.context.state.balance
                                    ? this.context.state.balance == -1
                                        ? '-'
                                        : <CountUp
                                            start={this.state.start}
                                            end={F.add(this.state.end, 0)}
                                            decimals={F.amountLen(this.state.end)}
                                            {...(F.isFloat(this.state.end) ? undefined : { formattingFn: e => F.toMoney(e) })}
                                        />
                                    : 0
                                }
                            </div>
                            <div className="label" style={{}}>{t('myBalance')}</div>
                        </div>
                    </div>
                    {this.back &&
                        <a href={this.back} className="back">{t('return')}</a>
                    }
                </div>
                <div className="row" >
                    <div className="col">
                        <div className="statistic">
                            <div className="value">{F.toMoney(F.sum(this.context.state.players || {}, 'bet'))}</div>
                            <div className="label">{t('totalBet')}</div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="statistic">
                            <div className="value">{Object.keys(this.context.state.players).length}</div>
                            <div className="label">{t('players')}</div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="statistic">
                            <div className="value">{this.context.state.online || 0}</div>
                            <div className="label">{t('onlineUsers')}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Info;
