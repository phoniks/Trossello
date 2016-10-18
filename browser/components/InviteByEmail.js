import React, { Component } from 'react'
import Form from './Form'
import Layout from './Layout'
import Link from './Link'
import Icon from './Icon'
import $ from 'jquery'
import boardStore from '../stores/boardStore'

class InviteByEmail extends Component {
  static contextType

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(){
    const email = this.refs.email.value
    console.log('hi',email);
    $.ajax({
      method: "POST",
      url: `/api/invites/${this.props.boardId}`,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({email}),
    }).then(() => {
      console.log('the post was successful');
    })
  }

  render() {
    return <div>
        <input type="email" ref="email" name='email' placeholder="john.doe@example.com" />
        <input type="submit" onClick={this.onSubmit} value="Invite"/>
    </div>
  }
}

export default InviteByEmail
