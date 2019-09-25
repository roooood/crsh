import React from 'react';
import autoBind from 'react-autobind';
import Drawer from 'react-drag-drawer';
import * as F from '../../library/Helper';
import { t } from '../../locales';
import Context from '../../library/Context';

import './Gift.css';
let gifts = [
    require('./logo/1.png'),
    require('./logo/2.png'),
    require('./logo/3.png'),
    require('./logo/4.png'),
    require('./logo/5.png'),
    require('./logo/6.png'),
    require('./logo/7.png'),
    require('./logo/8.png'),
    require('./logo/9.png'),
    require('./logo/10.png'),
];
let icon = [
    require('./icon/bost.png'),
    require('./icon/inc.png'),
    require('./icon/undo.png'),
]
let gift = Math.floor(Math.random() * 10)

class Gift extends React.Component {
    static contextType = Context;
    constructor(props, context) {
        super(props);
        this.state = {
            started: context.state.started,
            info: false,
            gift: 0,
            giftValue: 0,
            betCash: 0,
        };
        this.back = F.getQuery('ref');
        this.timer = null;
        autoBind(this);
    }
    random(num) {
        return Math.floor(Math.random() * num) + 1
    }
    componentWillReceiveProps(any, nextProps) {
        if (nextProps.state.started != this.state.started) {
            if (this.context.state.balance == -1 && nextProps.state.started == false) {
                if (this.random(3) == 1)
                    this.gift(this.random(3));
            }
            if (this.state.gift != false) {
                if (nextProps.state.started == true) {
                    if ([1, 3].includes(this.state.gift)) {
                        this.setState({ gift: false, giftValue: 0 })
                    }
                }
                else {
                    if (this.state.gift == 2) {
                        this.setState({ gift: false, giftValue: 0 })
                    }
                }

            }
            this.setState({ started: nextProps.state.started })
        }
    }
    inc() {
        if (this.context.state.balance == -1) {
            this.setState({ gift: false, giftValue: 0 })
            this.alert.show({ message: t('giftNeedLogin'), type: 'warning' });
            return;
        }
        this.timer = setInterval(() => {
            this.setState({ giftValue: this.state.giftValue + 100 })
        }, 30)
    }
    stop() {
        clearInterval(this.timer);
        this.getGift(2);
    }
    gift(type) {
        this.setState({ gift: type, giftValue: 0 })
    }
    getGift(type) {
        if (this.context.state.balance == -1) {
            this.setState({ gift: false, giftValue: 0 })
            this.alert.show({ message: t('giftNeedLogin'), type: 'warning' });
            return;
        }
        if (this.state.gift == type) {
            this.context.game.send({ myGift: this.state.giftValue });
            this.setState({ gift: false, giftValue: 0 })
        }
    }
    giftResult(cash) {
        this.alert.show({ message: t('addedToUrAccount').replace('#', F.toMoney(cash)), type: 'success' });
    }
    betAmount(cash) {
        this.setState({ betCash: parseInt(cash) })
    }
    componentDidMount() {
        this.context.game.register('gift', this.gift);
        this.context.game.register('giftResult', this.giftResult);
        this.context.game.register('betAmount', this.betAmount);
        this.alert = this.context.app('alert');
    }
    render() {
        if (this.context.state.isMobile) {
            return (
                <div className={"gbtns"}>
                    {this.state.gift == 1 &&
                        < div className={"rel  active"} >
                            <input className="gbtn" type="button" value={t('dareAward')} onClick={() => this.getGift(1)} />
                            <div className="btn2" />
                        </div>
                    }
                    {this.state.gift == 2 &&
                        <div className={"rel active hold"}>
                            <input className="gbtn btn "
                                type="button"
                                value={this.state.giftValue == 0 ? t('incCredit') : F.toMoney(this.state.betCash + this.state.giftValue)}
                                onMouseDown={() => this.state.gift == 2 ? this.inc() : null}
                                onMouseUp={() => this.stop()} />
                            <div className="btn2 gbtn2" />
                        </div>
                    }
                    {this.state.gift == 3 &&
                        <div className={"rel  active"}>
                            <input className="gbtn" type="button" value={t('ignoreLastLose')} onClick={() => this.getGift(3)} />
                            <div className="btn2" />
                        </div>
                    }
                </div>
            )
        }
        return (
            <div className="row gift" style={{ position: 'relative' }}>
                {this.back &&
                    <a href={this.back} className="back">{t('return')}</a>
                }
                <div className="col btns" >
                    <div className={"rel " + (this.state.gift == 1 ? 'active' : '')}>
                        <input className="btn" type="button" value={t('dareAward')} onClick={() => this.getGift(1)} />
                        <div className="btn2" />
                        <img src={icon[0]} />
                    </div>
                    <div className={"rel " + (this.state.gift == 2 ? 'active hold' : '')}>
                        <input className="btn "
                            type="button"
                            value={this.state.giftValue == 0 ? t('incCredit') : F.toMoney(this.state.betCash + this.state.giftValue)}
                            onMouseDown={() => this.state.gift == 2 ? this.inc() : null}
                            onMouseUp={() => this.stop()} />
                        <div className="btn2" />
                        <img src={icon[1]} />
                    </div>
                    <div className={"rel " + (this.state.gift == 3 ? 'active' : '')}>
                        <input className="btn" type="button" value={t('ignoreLastLose')} onClick={() => this.getGift(3)} />
                        <div className="btn2" />
                        <img src={icon[2]} />
                    </div>
                </div>
                <div className="col logo" onClick={() => this.setState({ info: true })}>
                    <img src={gifts[gift]} />
                </div>
                <Drawer
                    open={this.state.info}
                    modalElementclassName={'modal'}
                    onRequestClose={() => { this.setState(state => state.info = !state.info) }}
                >
                    <div className="gift-info" >
                        <h1>{t('guide')}</h1>
                        <ul>
                            <li><b>{t('dareAward')} :</b>{t('dareAwardDesc')}</li>
                            <li><b>{t('incCredit')} :</b>{t('incCreditDesc')}</li>
                            <li><b>{t('ignoreLastLose')} :</b>{t('ignoreLastLoseDesc')}</li>
                        </ul>
                    </div>
                </Drawer>
            </div>
        );
    }
}

export default Gift;