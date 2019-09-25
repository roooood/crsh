import React from 'react';
import autoBind from 'react-autobind';
import Drawer from 'react-drag-drawer';
import List from './List/List';
import Context from '../library/Context';

class Point extends React.Component {
    static contextType = Context;
    constructor(props) {
        super(props);
        this.state = {
            point: false,
            pointInfo: []
        };
        autoBind(this);
    }
    show(point) {
        this.context.game.send({ point })
        this.setState({ point, pointInfo: [] });
    }
    pointInfo(points) {
        this.setState({ pointInfo: points });
    }
    componentDidMount() {
        this.context.game.register('pointInfo', this.pointInfo);
    }
    render() {
        return (
            <Drawer
                open={this.state.point}
                modalElementClass={'modal'}
                onRequestClose={() => { this.setState(state => state.point = !state.point) }}
            >
                <div className='modal-table' style={{ height: '50vh' }} >
                    <List
                        players={this.state.pointInfo}
                    />
                </div>
            </Drawer>
        );
    }
}

export default Point;