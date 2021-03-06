import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as Actions from './../../actions';
import { ETH_DENOM } from './../../constants/variables';
import { getConcentDepositStatus } from './../../reducers';
import { timeStampToHR } from './../../utils/time';
import ConditionalRender from '../hoc/ConditionalRender';

const mapStateToProps = state => ({
  isEngineOn: state.info.isEngineOn,
  concentBalance: state.realTime.concentBalance,
  concentSwitch: state.concent.concentSwitch,
  concentRequiredSwitch: state.concent.concentRequiredSwitch,
  isMainNet: state.info.isMainNet,
  isOnboadingActive: !state.concent.hasOnboardingShown,
  showConcentToS: !state.info.isConcentTermsAccepted,
  nodeId: state.info.networkInfo.key,
  depositStatus: getConcentDepositStatus(state, 'concentDeposit'),
  isConcentWaiting: state.concent.isConcentWaiting
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch)
});

export class Concent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConcentOn: props.concentSwitch,
      isConcentRequiredOn: props.concentRequiredSwitch
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.concentSwitch !== this.props.concentSwitch) {
      this.setState({
        isConcentOn: nextProps.concentSwitch
      });
    }

    if (nextProps.concentRequiredSwitch !== this.props.concentRequiredSwitch) {
      this.setState({
        isConcentRequiredOn: nextProps.concentRequiredSwitch
      });
    }
  }

  _toggleConcentSwitch = () => {
    const {
      actions,
      concentBalance,
      isOnboadingActive,
      showConcentToS
    } = this.props;
    this.setState(
      {
        isConcentOn: !this.state.isConcentOn
      },
      () => {
        actions.toggleConcent(
          this.state.isConcentOn, //nextState of isConcentOn due to called in callback of state change
          (this.state.isConcentOn && //if prev state of concent is off and onboarding & terms are already passed before then inform RPC
            !isOnboadingActive &&
            !showConcentToS) ||
            (!this.state.isConcentOn && // if previous state of concent if on, but concent doesn't have deposit, instead of showing lock deposit modal, directly inform RPC
              concentBalance.value.isZero())
        );
      }
    );
  };

  _toggleConcentRequiredSwitch = () => {
    const { actions } = this.props;
    this.setState(
      {
        isConcentRequiredOn: !this.state.isConcentRequiredOn
      },
      () => actions.toggleConcentRequired(this.state.isConcentRequiredOn)
    );
  };

  _handleUnlockDeposit = () => {
    this.props.actions.unlockConcentDeposit();
  };

  render() {
    const {
      concentBalance,
      depositStatus,
      isMainNet,
      isEngineOn,
      nodeId,
      isConcentWaiting
    } = this.props;
    const { time, statusCode } = depositStatus;
    const { isConcentOn, isConcentRequiredOn } = this.state;
    return (
      <div
        className="content__concent"
        style={{ height: isConcentOn ? 200 : 360 }}>
        <span className="content__concent__info">
          Concent is service of the Golem network, which aims to improve the
          integrity
          <br />
          and security of marketplace. As a Provider, you should be paid for
          <br />
          computations, and as a Requestor, you are assured to get proper
          results.
          <br />
          <a href="https://docs.golem.network/#/Products/Clay-Beta/Usage?id=concent-service">
            Learn more
          </a>{' '}
          about Concent Service.
        </span>
        <div className="switch__concent">
          <div
            className={`switch-box ${!isConcentOn ? 'switch-box--green' : ''}`}>
            <label className="switch">
              <input
                type="checkbox"
                onChange={this._toggleConcentSwitch}
                checked={isConcentOn}
                aria-label="Concent switch on/off"
                tabIndex="0"
                disabled={!nodeId}
              />
              <div className="switch-slider round" />
            </label>
          </div>
          <span
            style={{
              color: isConcentOn ? '#4e4e4e' : '#9b9b9b'
            }}>
            Concent Service turned {!isConcentOn ? 'off' : 'on'}.
          </span>
        </div>
        <ConditionalRender showIf={isConcentOn}>
          <div className="switch__concent">
            <div
              className={`switch-box ${
                !isConcentRequiredOn ? 'switch-box--green' : ''
              }`}>
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={this._toggleConcentRequiredSwitch}
                  checked={!isConcentRequiredOn}
                  aria-label="Concent switch on/off"
                  tabIndex="0"
                  disabled={!nodeId}
                />
                <div className="switch-slider round" />
              </label>
            </div>
            <span
              style={{
                color: !isConcentRequiredOn ? '#4e4e4e' : '#9b9b9b'
              }}>
              Allow computing non concent tasks.
            </span>
          </div>
        </ConditionalRender>
        <ConditionalRender
          showIf={
            !isConcentOn &&
            Math.abs(statusCode) !== 1 &&
            !concentBalance.value.isZero()
          }>
          <div className="deposit-info__concent">
            {isConcentWaiting ? (
              <div className="waiting-response">
                <span>Updating deposit status...</span>
              </div>
            ) : (
              <div>
                <div>
                  <span>
                    Deposit amount:{' '}
                    <b>
                      {concentBalance
                        ? concentBalance.value.dividedBy(ETH_DENOM).toFixed(4)
                        : '-'}
                      {isMainNet ? ' ' : ' t'}
                      GNT
                    </b>
                    <br />
                    {statusCode === 2 ? (
                      <span>
                        <br />
                        Your balance will be unlocked at{' '}
                        <span className="timelock__concent">
                          {timeStampToHR(time)}
                        </span>
                        <br />
                        Turning it on again till this date will reduce potential
                        future deposit
                        <br />
                        creation transaction fees.{' '}
                        <a href="https://docs.golem.network/#/Products/Clay-Beta/Usage?id=how-much-can-i-save-by-not-unlocking-my-deposit">
                          Learn more
                        </a>
                      </span>
                    ) : (
                      <span>
                        <br />
                        You can turn it on without any additional transaction
                        fees,
                        <br />
                        transaction fees or you can unlock it now.{' '}
                        <a href="https://docs.golem.network/#/Products/Clay-Beta/Usage?id=can-i-withdraw-my-tokens-from-the-deposit">
                          Learn more
                        </a>
                      </span>
                    )}
                  </span>
                </div>
                {statusCode !== 2 && (
                  <div className="action__concent">
                    <button
                      className="btn--outline"
                      onClick={this._handleUnlockDeposit}
                      disabled={isConcentWaiting}>
                      {!isConcentWaiting ? (
                        <span>Unlock deposit</span>
                      ) : (
                        <span>
                          Unlocking deposit
                          <span className="jumping-dots">
                            <span className="dot-1">.</span>
                            <span className="dot-2">.</span>
                            <span className="dot-3">.</span>
                          </span>
                        </span>
                      )}
                    </button>
                    <span className="action-info__concent">
                      By leaving the Deposit locked you can
                      <br />
                      reduce future Deposit creation transaction
                      <br />
                      fee{' '}
                      <a href="https://docs.golem.network/#/Products/Clay-Beta/Usage?id=how-much-can-i-save-by-not-unlocking-my-deposit">
                        Learn more
                      </a>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </ConditionalRender>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Concent);
