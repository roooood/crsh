import React from 'react';
import autoBind from 'react-autobind';
import NumPad from 'react-numpad';
import * as F from '../../library/Helper';
import Crashing from './Crashing';
import { t } from '../../locales';
import Context from '../../library/Context';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import play from '../Sound';

import './Bet.css';

class Bet extends React.Component {
    static contextType = Context;
    constructor(props, context) {
        super(props);
        this.state = {
            started: context.state.started,
            bet: context.state.minBet,
            payout: 0,
            status: 'done',
            betCash: 0,
            tab: 1,

            inGame: false,
            reserve: null,

            isAuto: false,
            autoBet: null,
            autoBalance: context.state.maxBet,
            autoInc: 1,
            autoStop: 2,
            autoCount: 99,
            autoDec: 1,

            counter: 0
        };
        this.stopAt = 'up';
        this.back = F.getQuery('ref');
        autoBind(this);
    }
    betAmount(cash) {
        this.setState({ betCash: cash })
    }
    preStart() {
        if (this.state.status != 'done') {
            this.setState({ status: 'done' })
        }
        if (this.state.reserve != null && !this.state.isAuto) {
            this.setBet(this.state.reserve, this.state.payout);
            this.setState({ reserve: null })
        }
        if (this.state.isAuto) {
            this.handleAuto();
        }
    }
    AutoBet() {
        this.stopAt = this.state.autoBalance < this.context.state.balance ? 'down' : 'up';
        this.setState({ counter: 0, isAuto: true }, () => {
            if (this.state.started == false) {
                this.handleAuto();
            }
        });
    }
    manualBet() {
        let check = this.checkBalance(this.state.bet);
        if (!check) {
            return;
        }
        if (!this.state.started) {
            this.setBet(this.state.bet, this.state.payout);
        }
        else {
            this.setState({ reserve: this.state.bet, betCash: this.state.bet })
        }
    }
    handleAuto() {
        if (this.state.isAuto) {
            let check = this.checkBalance(this.state.autoBet);
            if (!check) {
                this.cancelAuto();
                return;
            }
            if (this.stopAt == 'up' && this.context.state.balance > this.state.autoBalance) {
                this.cancelAuto();
                return;
            }
            if (this.stopAt == 'down' && this.context.state.balance < this.state.autoBalance) {
                this.cancelAuto();
                return;
            }
            this.setBet(this.state.autoBet, this.state.autoStop);
        }
    }
    setBet(bet, payout) {
        this.context.game.send({ bet: [bet, payout] })
    }
    cancelAuto() {
        this.setState({ counter: 0, isAuto: false, inGame: false })
    }
    win(cash) {
        play('win')
        this.checkAuto(true);
        this.alert.show({ message: t('winMsg').replace('#', F.toMoney(cash)), type: 'success' });
    }
    lose(cash) {
        play('lose')
        this.checkAuto(false);
        this.alert.show({ message: t('loseMsg').replace('#', F.toMoney(cash)), type: 'error' });
    }
    checkAuto(win) {
        if (this.state.isAuto) {
            this.setState({ counter: this.state.counter + 1 })
            if (this.state.autoCount == this.state.counter) {
                this.cancelAuto();
            }

            if (win) {
                if (this.state.autoInc > 1) {
                    this.setState({ autoBet: (this.state.autoInc * this.state.autoBet) })
                }
            }
            else {
                if (this.state.autoDec > 1) {
                    this.setState({ autoBet: (this.state.autoBet / this.state.autoDec) })
                }
            }
        }
    }
    bet() {
        if (this.state.tab == 1) {
            this.manualBet();
        }
        else {
            this.AutoBet();
        }
        this.setState({ inGame: true })
    }
    cancel() {
        if (this.state.isAuto) {
            this.cancelAuto();
            this.context.game.send({ cancel: 1 })
        }
        else if (this.state.started) {
            this.setState({ reserve: null })
        } else {
            this.context.game.send({ cancel: 1 })
        }
        this.setState({ inGame: false })
    }
    done() {
        if (this.state.started) {
            this.context.game.send({ done: 1 })
        }
        if (this.state.isAuto) {
            this.cancelAuto();
        }
        this.setState({ inGame: false })
    }
    betChange(key, val) {
        if (val == '' || val == 0) return;
        let bet = this.checkBalance(val)
        if (bet)
            this.setState(state => (state[key] = val, state))
    }
    cashOutChange(key, val) {
        if (val == '') return;
        this.setState(state => (state[key] = parseFloat(val).toFixed(2), state))
    }
    autoChange(key, val) {
        if (val == '') return;
        this.setState(state => (state[key] = val, state))
    }
    tab(val) {
        if (!this.state.inGame)
            this.setState({ tab: val })
    }
    plus(val) {
        if (this.state.inGame)
            return;
        let newBet;
        switch (val) {
            case 'double':
                newBet = F.add(this.state.bet * 2, 0);
                break;
            case 'half':
                newBet = F.add(this.state.bet / 2, 0);
                break;
            case 'min':
                newBet = F.add(this.context.state.minBet, 0);
                break;
            case 'max':
                newBet = this.context.state.balance > this.context.state.maxBet ? this.context.state.maxBet : this.context.state.balance;
                break;
            case '100k':
                newBet = F.isFloat(this.context.state.minBet) ? 0.01 : 100000;
                break;
            default:
                val = F.isFloat(this.context.state.minBet) ? val * 0.000000100001 : val;
                newBet = F.add(this.state.bet, val);
                break;
        }
        let bet = this.checkBalance(newBet)
        if (bet)
            this.setState({ bet: newBet })
    }
    checkBalance(bet) {
        if (bet > this.context.state.balance) {
            this.alert.show({ message: t('lessCredit'), type: 'warning' });
            return false;
        }
        if (bet < this.context.state.minBet) {
            this.alert.show({ message: t('lessThanLimit'), type: 'warning' });
            return false;
        }
        if (bet > this.context.state.maxBet) {
            this.alert.show({ message: t('moreThanLimit'), type: 'warning' });
            return false;
        }
        return true;
    }
    componentDidMount() {
        this.context.game.register('betResult', this.result);
        this.context.game.register('win', this.win);
        this.context.game.register('lose', this.lose);
        this.context.game.register('timer', this.preStart);
        this.context.game.register('betAmount', this.betAmount);
        this.alert = this.context.app('alert');
    }
    result(type) {
        if (type == 'error') {
            this.alert.show({ message: t('invalidAmount'), type: 'error' });
        }
        if (this.state.tab == 1 && type == 'done' && this.state.reserve == null) {
            this.setState({ inGame: false })
        }
        this.setState({ status: type })
    }
    componentWillReceiveProps(any, nextProps) {
        if (nextProps.state.started != this.state.started) {
            this.setState({ started: nextProps.state.started })
        }

    }
    renderBtn() {
        let start =
            <button type="button" className="ok-btn" onClick={() => this.bet()} >
                {t('start')}
            </button>;
        let reserve =
            <button type="button" className="ok-btn" onClick={() => this.bet()} >
                {t('reserve')}
            </button>;
        let stop =
            <button type="button" className="done-btn" onClick={() => this.done()} >
                {this.state.started ? <Crashing Game={this.context.game} betCash={this.state.betCash} status={this.state.status} /> : t('stop')}
            </button>
        let cancel =
            <button type="button" className="cancel-btn" onClick={() => this.cancel()} >
                <bdi>{t('cancel') + ' ' + (this.state.betCash > 0 ? "(" + F.toMoney(this.state.betCash) + ")" : "")}</bdi>
            </button>
        let cancelReserve =
            <button type="button" className="cancel-btn" onClick={() => this.cancel()} >
                <bdi>{t('cancelReserve') + ' ' + "(" + F.toMoney(this.state.betCash) + ")"}</bdi>
            </button>
        let ret = null;

        if (this.state.isAuto) {
            ret = stop;
        }
        else if (this.state.tab == 2) {
            ret = start;
        }
        else if (this.state.reserve != null) {
            ret = cancelReserve;
        }
        else if (this.state.status == 'done') {
            ret = this.state.started ? reserve : start;
        }
        else if (this.state.status == 'bet') {
            ret = this.state.started ? stop : cancel;
        }
        else if (this.state.status == 'cancel') {
            ret = start;

        }
        return ret
    }
    renderSign() {
        return (
            <div className="row">
                <button type="button" className="link done-btn" onClick={() => this.goto('register')} >{t('signUp')}</button>
                <button type="button" className="link ok-btn" onClick={() => this.goto('auth')} >{t('signIn')}</button>
            </div>
        )
    }
    goto(path) {
        window.location = this.back + "/" + path
    }
    render() {
        if (this.state.bet == null) {
            this.state.bet = this.context.state.minBet;
        }
        if (this.state.autoBet == null) {
            this.state.autoBet = this.context.state.minBet;
        }

        return (
            <div className="bet">
                <ul className="tabs">
                    <li className={"tab-link " + (this.state.tab == 1 ? 'current' : '')} onClick={() => this.tab(1)}>{t('manual')}</li>
                    <li className={"tab-link " + (this.state.tab == 2 ? 'current' : '')} onClick={() => this.tab(2)}>{t('auto')}</li>
                </ul>
                <section className={"tab-content " + (this.state.tab == 1 ? 'current' : '')}>
                    <div className="row" style={{ alignItems: 'flex-end' }}>
                        <div className="col" style={{ flex: 1 }}>
                            <div className="label">{t('amount')}</div>
                            {this.state.inGame
                                ? <button type="button" className="input" >{F.toMoney(this.state.bet)}</button>
                                : <NumPad.Number
                                    onChange={(value) => this.betChange('bet', value)}
                                    negative={false}
                                    decimal={F.isFloat(this.context.state.minBet)}
                                >
                                    <button type="button" className="input" >{F.toMoney(this.state.bet)}</button>
                                </NumPad.Number>
                            }
                        </div>
                        <div className="col" style={{ flex: 1 }}>
                            <div className="label">{t('cashOut')}</div>
                            {this.state.inGame
                                ? <button type="button" className="input" >{this.state.payout}</button>
                                : <NumPad.Number
                                    onChange={(value) => this.cashOutChange('payout', value)}
                                    negative={false}
                                >
                                    <button type="button" className="input" >{this.state.payout}</button>
                                </NumPad.Number>
                            }
                        </div>
                    </div>
                    <div className="row" style={{ alignItems: 'flex-end' }}>
                        <div className="row" style={{ margin: 0, opacity: this.state.inGame ? .4 : 1 }}>
                            <button className="btn min" type="button" onClick={() => this.plus(100)} >+100</button>
                            <button className="btn min" type="button" onClick={() => this.plus(1000)} >+1k</button>
                            <button className="btn min" type="button" onClick={() => this.plus(10000)} >+10k</button>
                            <button className="btn min in-web" type="button" onClick={() => this.plus('100k')} >+100k</button>
                            <button className="btn min" type="button" onClick={() => this.plus('double')} >x2</button>
                            <button className="btn min" type="button" onClick={() => this.plus('half')} >1/2</button>
                            <button className="btn min" type="button" style={{ fontSize: 20 }} onClick={() => this.plus('min')} ><ArrowDownward style={{ marginTop: 5 }} /></button>
                            <button className="btn min" type="button" style={{ fontSize: 20 }} onClick={() => this.plus('max')} ><ArrowUpward style={{ marginTop: 5 }} /></button>
                        </div>
                    </div>
                    <div className="row balance in-mobile" style={this.context.state.balance ? {} : { display: 'none' }} >
                        <span> {t('moblieMyBalance')} :  </span>
                        {this.context.state.balance ? this.context.state.balance == -1 ? '-' : F.toMoney(this.context.state.balance) : 0}
                    </div>
                </section>
                <section className={"auto tab-content " + (this.state.tab == 2 ? 'current' : '')}>
                    <div className="row">
                        <div className="col" >
                            <div className="label">{t('autoAmount')}</div>
                            {this.state.inGame
                                ? <button type="button" className="input" >{F.toMoney(this.state.autoBet)}</button>
                                : <NumPad.Number
                                    onChange={(value) => this.betChange('autoBet', value)}
                                    negative={false}
                                    decimal={F.isFloat(this.context.state.minBet)}
                                >
                                    <button type="button" className="input" >{F.toMoney(this.state.autoBet)}</button>
                                </NumPad.Number>
                            }
                        </div>
                        <div className="col" >
                            <div className="label">{t('cashOutCredit')}</div>
                            <NumPad.Number
                                onChange={(value) => this.autoChange('autoBalance', value)}
                                negative={false}
                                decimal={F.isFloat(this.context.state.minBet)}
                            >
                                <button type="button" className="input" >{F.toMoney(this.state.autoBalance)}</button>
                            </NumPad.Number>
                        </div>
                        <div className="col" style={{ position: 'relative' }}>
                            <div className="label">{t('incIfWin')}</div>
                            <NumPad.Number
                                onChange={(value) => this.autoChange('autoInc', value)}
                                negative={false}
                            >
                                <button type="button" className="input" >{this.state.autoInc}</button>
                            </NumPad.Number>
                            <span className="mul">x</span>
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: '-1%' }}>
                        <div className="col">
                            <div className="label">{t('cashOut')}</div>
                            {this.state.inGame
                                ? <button type="button" className="input" >{this.state.autoStop}</button>
                                : <NumPad.Number
                                    onChange={(value) => this.cashOutChange('autoStop', value)}
                                    negative={false}
                                >
                                    <button type="button" className="input" >{this.state.autoStop}</button>
                                </NumPad.Number>
                            }
                        </div>
                        <div className="col">
                            <div className="label"> {t('playCount')} </div>
                            <NumPad.Number
                                onChange={(value) => this.autoChange('autoCount', value)}
                                negative={false}
                                decimal={F.isFloat(this.context.state.minBet)}
                            >
                                <button type="button" className="input" >{this.state.autoCount - this.state.counter}</button>
                            </NumPad.Number>
                        </div>
                        <div className="col" style={{ position: 'relative' }}>
                            <div className="label">{t('decIfLose')}</div>
                            <NumPad.Number
                                onChange={(value) => this.autoChange('autoDec', value)}
                                negative={false}
                            >
                                <button type="button" className="input" >{this.state.autoDec}</button>
                            </NumPad.Number>
                            <span className="mul">/</span>
                        </div>
                    </div>
                    <div className="row balance in-mobile" style={this.context.state.balance ? {} : { display: 'none' }} >
                        <span> {t('moblieMyBalance')} :  </span>
                        {this.context.state.balance ? this.context.state.balance == -1 ? '-' : F.toMoney(this.context.state.balance) : 0}
                    </div>
                </section>

                <div className="row center"  >
                    {this.context.state.balance == -1
                        ? this.renderSign()
                        : this.renderBtn()
                    }
                </div>
            </div>
        );
    }

}

export default Bet;