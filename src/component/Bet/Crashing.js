import React, { Component } from 'react';
import autoBind from 'react-autobind';
import * as F from '../../library/Helper';
import Context from '../../library/Context';
import { t } from '../../locales';

class Crashing extends Component {
    static contextType = Context;
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
        };
        autoBind(this);
    }
    crashing(crash) {
        if (this.props.status != 'done')
            this.setState({ x: crash })
    }
    componentDidMount() {
        this.context.game.register('c', this.crashing);
    }
    render() {
        return (
            <bdi>
                {t('stop') + " " + ((this.props.status == 'bet' && this.state.x > 0) ? "(" + F.toMoney((this.state.x * this.props.betCash)) + ")" : "")}
            </bdi>
        );
    }
}

export default Crashing;