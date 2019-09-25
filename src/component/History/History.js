import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { t } from '../../locales';
import Context from '../../library/Context';

class Table extends React.Component {
    static contextType = Context;
    render() {
        return (
            <div className="table hover striped">
                {this.props.children}
            </div>
        );
    }
}

const Row = ({ header = false, children, color, id, Point }) => {
    color = color > 2 ? 'rgb(57, 189, 151)' : 'rgb(248, 14, 121)';
    return (
        <div className={"table__row" + (header == true ? " table__row--header" : "")}
            onClick={() => header == true ? null : Point.show(id)}
            style={{ color: color }}>
            <div className='wrapper'>
                {children}
            </div>
        </div>
    );
};

const Column = ({ width, children }) => (
    <div className='column' style={{ width }}>
        {children}
    </div>
);

class DataGrid extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { columns, data, Point } = this.props;
        return (
            <Table>
                <Row header>
                    {columns.map((column, i) => (
                        <Column key={i} width={column.width}>{column.label}</Column>
                    ))}
                </Row>
                <Scrollbars>
                    {data.map((row, i) => {
                        return (
                            <Row key={i} color={row.point} id={row.id} Point={Point} >
                                {['point', 'hash'].map((key, index) => {
                                    let val = row[key];
                                    return (
                                        <Column key={index} width={columns[index].width}>{val}</Column>
                                    );
                                })}
                            </Row>
                        );
                    })}
                    <div style={{ height: 60 }}>

                    </div>
                </Scrollbars>
            </Table>
        );
    }
}

class History extends React.Component {
    static contextType = Context;
    constructor(props) {
        super(props);
    }
    render() {
        const point = this.context.app('point');
        return (
            <DataGrid
                columns={[
                    { label: t('endPoint'), width: '25%' },
                    { label: t('hash'), width: '75%' },
                ]}
                data={this.context.state.history || []}
                Point={point}
            />
        );
    }
}

export default History;