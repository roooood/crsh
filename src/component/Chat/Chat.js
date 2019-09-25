import React, { Component } from 'react';
import MeteorEmoji from 'meteor-emoji/dist/meteorEmoji';
import { Scrollbars } from 'react-custom-scrollbars';
import Context from '../../library/Context';
import autoBind from 'react-autobind';

import './chat.css';
import { t } from '../../locales';

class SendButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    }
    this.Count = this.Count.bind(this)
  }
  Count(val) {
    this.setState({ count: val })
    if (val > 0)
      setTimeout(() => {
        this.Count(val - 1)
      }, 1000);
  }
  render() {
    return (<div className="btn send_message" onClick={this.props.handleClick}>
      <div className="text">{this.state.count ? this.state.count : t('send')}</div>
    </div>);
  }
}

class MessageTextBoxContainer extends Component {
  constructor(props) {
    super(props);
    this.getVal = this.getVal.bind(this)
    this.setVal = this.setVal.bind(this)
  }
  componentDidMount() {
    new MeteorEmoji();
  }
  shouldComponentUpdate() {
    return true;
  }
  getVal() {
    return this.input.value
  }
  setVal(val) {
    this.input.value = val;
  }
  render() {
    return (
      <div className="message_input_wrapper">
        <input
          maxLength="50"
          ref={(ref) => this.input = ref}
          data-meteor-emoji="true"
          disabled={!this.props.login}
          className="message_input"
          placeholder={t('writeSomething')}
          onKeyPress={this.props._handleKeyPress} />
      </div>
    );
  }
}

class UserMessageBox extends Component {
  constructor(props) {
    super(props);
  }
  delete(id) {
    this.props.Game.send({ delete: id });
  }
  mute(uid) {
    this.props.Game.send({ mute: uid });
  }
  render() {
    const { message } = this.props;
    return (
      <li className={`message left appeared`}>
        {/* <Avartar></Avartar> */}
        <div className="text_wrapper">
          <div className="sender">{message.sender}
            {this.props.admin == true &&
              <div className="tools">
                <button type="button" onClick={() => this.delete(message.id)} >{t('delete')}</button>
                <button type="button" onClick={() => this.mute(message.uid)} >{t('mute')}</button>
              </div>
            }
          </div>
          <div className="text">{message.message}</div>
        </div>
      </li>
    );
  }
}

class MessagesContainer extends Component {
  constructor(props) {
    super(props);
    this.messageLen = this.props.messages.length
    this.createBotMessages = this.createBotMessages.bind(this);
  }

  scrollToBottom = () => {
    let el = this.refs.scroll;
    el.scrollTop = el.scrollHeight;
  }
  scrollToTop = () => {
    let el = this.refs.scroll;
    el.scrollTop(0);
  }

  componentDidMount() {
    this.scrollToTop();
  }

  componentDidUpdate() {
    if (this.messageLen != this.props.messages.length) {
      this.messageLen = this.props.messages.length
      this.scrollToTop();
    }
  }

  createBotMessages() {
    let data = this.props.messages, i;
    // for (i of this.props.messages) {
    //   data.unshift(i)
    // }
    let len = data.length;
    return data.map((message, index) =>
      <UserMessageBox key={len - index} Game={this.props.Game} message={message} admin={this.props.admin} />
    );
  }

  render() {
    return (
      <ul className="messages"  >
        <Scrollbars style={{ direction: 'ltr', height: '100%' }} ref="scroll">
          <div style={{ direction: this.props.dir, height: '100%' }} >
            {this.createBotMessages()}
          </div>
        </Scrollbars>
      </ul>
    );
  }
}


class ChatApp extends Component {
  static contextType = Context;
  constructor(props) {
    super(props);
    this.state = {
      inGame: false
    }

    this.limit = false;
    autoBind(this);
  }
  componentDidMount() {
    this.context[this.props.server].register('leave', this.leave);
    this.context[this.props.server].register('welcome', this.welcome);
  }

  welcome() {
    this.setState({ inGame: true })
  }
  leave() {
    this.setState({ inGame: false })
  }
  addMessageBox(enter = true) {
    if (!('id' in this.context.state)) {
      let xalert = this.context.app('alert');
      xalert.show({ message: t('guestCantchat'), type: 'error' });
      return;
    }
    else if (!this.state.inGame) {
      let xalert = this.context.app('alert');
      xalert.show({ message: t('inGamechat'), type: 'error' });
      return;
    }
    let current_message = this.messageBox.getVal();
    if (current_message && enter && !this.limit) {
      let message = current_message.substring(0, 50)
      this.context[this.props.server].send({ chat: message });
      this.messageBox.setVal('');
      this.limit = true;
      this.btn.Count(10);
      setTimeout(() => this.limit = false, 10000)
    }

  }

  handleClick() {
    this.addMessageBox();
  }

  _handleKeyPress(e) {
    let enter_pressed = false;
    if (e.key === "Enter") {
      enter_pressed = true;
    }
    this.addMessageBox(enter_pressed)
  }

  render() {
    return (
      <div className="chat_window">
        <MessagesContainer
          dir={this.context.state.dir}
          Game={this.context[this.props.server]}
          admin={'admin' in this.context.state && this.context.state.admin == true}
          messages={this.context.state[this.props.load] || []} />
        <div className="bottom_wrapper clearfix" style={{ direction: this.context.state.dir }} >
          <MessageTextBoxContainer
            ref={ref => this.messageBox = ref}
            login={('id' in this.context.state)}
            _handleKeyPress={this._handleKeyPress}
          />
          <SendButton ref={ref => this.btn = ref} handleClick={this.handleClick}></SendButton>
        </div>

      </div>
    );
  }
}



export default ChatApp;
