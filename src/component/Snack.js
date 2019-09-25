import React from 'react';
import autoBind from 'react-autobind';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Grow from '@material-ui/core/Grow';

const styles = {
    snack: {
        marginTop: 40
    },
    error: {
        background: '#d32f2f',
    },
    warning: {
        background: '#ffa000',
    },
    info: {
        background: '#1976d2',
    },
    success: {
        background: '#43a047',
    },
}
class Alert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            type: '',
            show: false,
        };
        autoBind(this);
    }
    TransitionUp(props) {
        return <Grow  {...props} />;
    }
    closeSnack() {
        this.setState({ show: false })
    }
    show(data) {
        this.setState({ ...data, show: true })
    }
    render() {

        return (
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={this.state.show}
                onClose={this.closeSnack}
                TransitionComponent={this.TransitionUp}
                style={styles.snack}
                autoHideDuration={6000}

            >
                <SnackbarContent
                    style={this.state.type ? styles[this.state.type] : {}}
                    message={this.state.message}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            style={styles.close}
                            onClick={this.closeSnack}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
            </Snackbar>
        );
    }
}

export default Alert;