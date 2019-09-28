import React, { Component } from 'react';
import Context from './library/Context';
import autoBind from 'react-autobind';
import SwipeableViews from 'react-swipeable-views';
import Chart from './component/Chart/Chart';
import Bet from './component/Bet/Bet';
import Info from './component/Info';
import List from './component/List/List';
import Chat from './component/Chat/Chat';
import History from './component/History/History';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/core/styles';

import { t } from './locales';

const StyledTabs = withStyles({
    root: {
        overFlow: 'hidden',
        borderRadius: 10,
    },
    indicator: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        '& > div': {
        },
    },
})(props => <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />);

const StyledTab = withStyles(theme => ({
    root: {
        textTransform: 'none',
        color: '#fff',
        fontSize: theme.typography.pxToRem(13),
        minWidth: 30,
        backgroundColor: '#17141f',
        '&:focus': {
            opacity: 1,
            backgroundColor: 'transparent',
        },
        '&$selected': {
            backgroundColor: 'transparent',
        }
    },
    selected: {}
}))(props => <Tab disableRipple {...props} />);


function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <Typography style={{ height: '93%' }} component="div" role="tabpanel" hidden={value !== index} {...other}>
            {children}
        </Typography>
    );
}

class Route extends Component {
    static contextType = Context;
    constructor(props) {
        super(props);
        this.state = {
            tab: 1,
            mobile: 1,
        };
        autoBind(this);
    }
    handleChangeTab(e, tab) {
        this.setState({ tab })
    }
    tab() {
        return (
            <div style={{ flexGrow: 1, ...styles.bg, overflow: 'hidden', borderRadius: 10 }} >
                <StyledTabs
                    variant="fullWidth"
                    value={this.state.tab}
                    onChange={this.handleChangeTab}
                >
                    <StyledTab label={t('history')} />
                    <StyledTab label={t('chat')} />
                </StyledTabs>
                <TabPanel value={this.state.tab} index={0}>
                    <History />
                </TabPanel>
                <TabPanel value={this.state.tab} index={1}>
                    <Chat load="message" server="game" />
                </TabPanel>
            </div>
        )
    }
    list() {
        return (
            <>
                <Grid xs={12} style={{ ...styles.xdir, flex: .25, marginBottom: 10 }}  >
                    <Info />
                </Grid>
                <Grid container xs={12} style={{ ...styles.xdir, flex: .75, overflow: 'hidden' }} >
                    <List />
                </Grid>
            </>
        )
    }
    game() {
        return (
            <>
                <Grid xs={12} style={{ ...styles.xdir, flex: .45, marginBottom: 10, width: '100%' }} className="pchart" >
                    <Chart />
                </Grid>
                <Grid container xs={12} style={{ ...styles.xdir, flex: .55, overflow: 'hidden' }} >
                    <Bet />
                </Grid>
            </>
        )
    }
    render() {
        if (this.context.state.isMobile)
            return (
                <SwipeableViews className="is-mobile" index={this.state.mobile} enableMouseEvents slideStyle={{ width: '100vw', height: '100vh' }}>
                    <div style={{ ...styles.mdir, direction: this.context.state.dir }} >
                        {this.list()}
                    </div>
                    <div style={{ ...styles.mdir, direction: this.context.state.dir, }} >

                        {this.game()}
                    </div>
                    <div style={{ ...styles.mdir, direction: this.context.state.dir }} >
                        {this.tab()}
                    </div>
                </SwipeableViews>
            )
        return (
            <Grid style={styles.root} className="is-web" >
                <Grid style={{ ...styles.dir, width: '30%' }} container direction="column">
                    <Grid container xs={12} style={{ ...styles.xdir, overflow: 'hidden' }} >
                        {this.tab()}
                    </Grid>
                </Grid>
                <Grid xs={5} style={{ ...styles.dir, marginLeft: 0, marginRight: 0, width: '40%' }} container direction="column" >
                    {this.game()}
                </Grid>
                <Grid xs={4} style={{ ...styles.dir, width: '30%' }} container direction="column">
                    {this.list()}
                </Grid>
            </Grid>
        );

    }
}
const styles = {
    bg: {
        background: 'rgb(34, 29, 47)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)'
    },
    root: {
        flexGrow: 1,
        width: '100%',
        display: 'flex',
        boxSizing: 'border-box',
        overflow: 'hidden'
    },
    mdir: {
        display: 'flex',
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        padding: 10
    },
    dir: {
        display: 'flex',
        margin: 10,
        position: 'relative',
    },
    xdir: {
        display: 'flex',
        background: 'rgb(34, 29, 47)',
        borderRadius: 10,
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)'
    },
    border: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)'
    }
}
export default Route;