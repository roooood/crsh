import React from 'react';
import autoBind from 'react-autobind';
import './assets/css/app.css';
import * as F from './library/Helper';
import Game from './library/Game';
import Context from './library/Context';
import Snack from './component/Snack';
import Point from './component/Point';
import Route from './Route';
const lang = F.getQuery('lang') || 'fa';
const dir = lang == 'fa' ? 'rtl' : 'ltr';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      message: [],
      players: [],
      isFocus: true,
      isMobile: window.innerWidth < 800,
      point: false,
      pointInfo: [],
      userKey: F.getQuery('token') || '-',
      dir: dir,
    };

    autoBind(this);
  }
  balance(balance) {
    this.setState({ balance: balance })
  }
  onResize() {
    let width = window.innerWidth;
    if (width < 850 && !this.state.isMobile)
      this.setState({ isMobile: true })
    else if (width > 850 && this.state.isMobile)
      this.setState({ isMobile: false })
  }
  onFocus() {
    this.setState({ isFocus: true })
  }
  onBlur() {
    this.setState({ isFocus: false })
  }

  connected(data) {
    this.setState(data);
    Game.onState((state) => {
      this.setState(state);
    });
  }
  componentWilUnmount() {
    window.removeEventListener("focus", this.onFocus)
    window.removeEventListener('blur', this.onBlur);
    // window.removeEventListener('resize', this.onResize);
  }
  componentDidMount() {
    Game.reset();
    Game.register('welcome', this.connected);
    Game.register('balance', this.balance);
    Game.register('failedJoin', this.joinTable);
    this.connect();

    window.addEventListener('blur', this.onBlur);
    window.addEventListener("focus", this.onFocus);
    // window.addEventListener("resize", this.onResize);
  }
  joinTable() {
    setTimeout(() => {
      Game.getAvailableRooms((rooms) => {
        if (rooms.length > 0) {
          Game.join(rooms[0].roomId, { key: this.state.userKey });
        }
        else {
          Game.join('crash', { create: true, key: this.state.userKey });
        }
      });
    }, 1000);
  }
  connect() {
    if (!Game.isConnect) {
      Game.connect(
        () => this.joinTable(),
        () => setTimeout(() => { this.connect() }, 2000)
      );
    }
  }

  changeState(obj) {
    this.setState(obj)
  }
  app(obj) {
    return this[obj];
  }
  render() {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex' }}>
        <Context.Provider value={{ game: Game, state: this.state, app: this.app, setState: this.changeState }}>
          <Snack ref={r => this.alert = r} />
          <Point ref={ref => this.point = ref} />
          <Route />
        </Context.Provider>
      </div>
    )
  }
}

export default App;