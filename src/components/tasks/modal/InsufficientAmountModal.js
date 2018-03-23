import React from 'react';
import { hashHistory } from 'react-router'

export default class InsufficientAmountModal extends React.Component {


    constructor(props) {
        super(props);
    }

    /**
     * [_handleCancel funcs. closes modal]
     */
    _handleCancel() {
        this.props.closeModal('insufficientAmountModal')
    }

    _handleTopUp() {
        hashHistory.push('/');
    }

    render() {
        return (
            <div className="container__modal container__delete-modal">
                <div className="content__modal">
                    <div>
                        <span className="icon-warning"/>
                    </div>
                    <span>You don't have enough funds<br/>to send a task to a network.</span>
                    <div className="action__modal">
                        <span className="btn--cancel" onClick={::this._handleCancel}>Cancel</span>
                        <button type="button" className="btn--primary" onClick={::this._handleTopUp} autoFocus>Top up</button>
                    </div>
                </div>
            </div>
        );
    }
}