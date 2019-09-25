import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import * as F from '../../library/Helper';
import { t } from '../../locales';
import Context from '../../library/Context';

class Table extends React.Component {
    render() {
        return (
            <div className="table hover striped">
                {this.props.children}
            </div>
        );
    }
}

const Row = ({ header = false, children, color }) => {
    color = color > 0 ? 'rgb(57, 189, 151)' : (color === 0 ? 'rgb(248, 14, 121)' : '#fafafa')
    return (
        <div className={"table__row" + (header == true ? " table__row--header head-bg" : "")}
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
    static contextType = Context;
    constructor(props) {
        super(props);
    }
    render() {
        const { columns } = this.props;
        let data = this.props.data, data1 = [], data2 = [], i, j;
        for (j in data) {
            i = data[j];
            if ('started' in this.props && this.context.state.started) {
                if (i.stop > 0) {
                    data2.push(i)
                }
                else {
                    data1.push(i)
                }
            } else {
                if (i.stop > 0) {
                    data1.push(i)
                }
                else {
                    data2.unshift(i)
                }
            }

        }
        return (
            <Table>
                <Row header>
                    {columns.map((column, i) => (
                        <Column key={i} width={column.width}>{column.label}</Column>
                    ))}
                </Row>
                <Scrollbars>
                    {[...data2, ...data1].map((row, i) => {
                        let stop = row.stop;
                        if (!('cashOut' in row)) {
                            row.cashOut = '.';
                            stop = -1;
                        }
                        return (
                            <Row key={i} color={stop}>
                                {Object.keys(row).map((key, index) => {
                                    if (index > columns.length - 1) return;
                                    let val = row[key];
                                    if (['bet', 'cashOut'].includes(key)) {
                                        val = F.toMoney(val);
                                    }
                                    if (['stop', 'cashOut'].includes(key) && val == 0)
                                        val = '.';
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

class List extends React.Component {
    static contextType = Context;
    constructor(props) {
        super(props);
    }
    componentDidMount() {

    }
    render() {
        const data = ('players' in this.props) ? this.props.players : this.context.state.players;
        return (
            <DataGrid
                columns={[
                    { label: t('user'), width: '40%' },
                    { label: t('bet'), width: '25%' },
                    { label: t('end'), width: '15%' },
                    { label: t('profit'), width: '20%' },
                ]}
                data={data}
            />
        );
    }
}

export default List;