import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { hashHistory, Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as Actions from '../actions'

import mainNetLogo from './../assets/img/mainnet-logo-small.svg'
import testNetLogo from './../assets/img/testnet-logo-small.svg'

/**
 * @see http://react-component.github.io/tooltip/
 */
import ReactTooltip from 'rc-tooltip'
const {remote} = window.electron;
const {BrowserWindow, dialog} = remote
const mainProcess = remote.require('./index')

const mapStateToProps = state => ({
    isEngineOn: state.info.isEngineOn,
    fileCheckModal: state.info.fileCheckModal,
    connectedPeers: state.realTime.connectedPeers,
    isMainNet: state.info.isMainNet
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(Actions, dispatch)
})

const DOCLINK = "https://docs.golem.network/"

/**
 * { Class for header component with navigation. }
 *
 * @class      Header (name)
 */
export class Header extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const index = location.hash.includes('tasks') ? 1 : 0; // <-- HARDCODED
        let navItems = document.getElementsByClassName('nav__item');
        navItems.length > 1 && navItems[index].classList.add('active');
    /*EXPRIMENTAL*/
    // window.require('electron').ipcRenderer.on('REDIRECT_FROM_TRAY', (event, message) => {
    //     this._navigateTo(message, null)
    // })
    }

    /**
     * [_navigateTo active class handling for navigation items]
     * @param  {String}     to      [Route fo the page]
     * @param  {Object}     elm     [Element in target]
     */
    _navigateTo(to, elm) {
        let navItems = document.getElementsByClassName('nav__item');
        let menuItems = document.getElementsByClassName('menu__item');

        [].map.call(navItems, (item) => {
            item.classList.remove('active')
        });

        [].map.call(menuItems, (item) => {
            item.classList.remove('active')
        });

        elm && elm.currentTarget.classList.add('active')

        hashHistory.push(to);
    }


    /**
     * [_onClose,_onMinimize,_onMaximize Native Window Button handlers]
     */
    _onClose() {
        let win = BrowserWindow.getFocusedWindow();
        win.close()
    }

    _onMinimize() {
        let win = BrowserWindow.getFocusedWindow();
        win.minimize()
    }

    _onMaximize() {
        let win = BrowserWindow.getFocusedWindow();
        win.isMaximized() ? win.unmaximize() : win.maximize()
    }


    /**
     * [_handleTab to change active class of selected tab title]
     * 
     * @param   {Object}     elm     [target element]
     */
    _handleMenu(to, elm) {
        if (this.props.taskDetails.options && Number(this.props.taskDetails.options.frame_count) > 1) {
            let menuItems = document.getElementsByClassName('menu__item')
            for (var i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active')
            }
            elm.currentTarget.classList.add('active')
            hashHistory.push(`/preview/${to}`);
        }
    }

    /**
     * [_onFileDialog func. opens file chooser dialog then checks if files has safe extensions after all redirects user to the new task screen]
     */
    _onFileDialog() {

        const checkDominantType = function(files) {
            const isBiggerThanOther = function(element, index, array) {
                return element[1] !== array[0][1];
            }
            const tempFiles = [...files.reduce((acc, s) => acc.set(s, (acc.get(s) || 0) + 1), new Map)]
            const anyDominant = tempFiles.some(isBiggerThanOther)

            if (!anyDominant && tempFiles.length > 1) {
                return false
            } else {
                return tempFiles
                    .sort((a, b) => b[1] - a[1])
                    .map(a => a[0])[0];
            }
        }

        const onFileHandler = (data) => {
            //console.log(data)
            if (data) {

                mainProcess.selectDirectory(data, this.props.isMainNet)
                    .then(item => {
                        let mergedList = [].concat.apply([], item)
                        let unknownFiles = mergedList.filter(({malicious}) => (malicious))
                        let masterFiles = mergedList.filter(({master}) => (master));
                        let dominantFileType = checkDominantType(masterFiles.map(file => file.extension));

                        (masterFiles.length > 0 || unknownFiles.length > 0) && this._navigateTo(`/add-task/type${!!dominantFileType ? `/${dominantFileType.substring(1)}` : ''}`, null)

                        if (unknownFiles.length > 0) {
                            this.props.actions.setFileCheck({
                                status: true,
                                files: unknownFiles
                            })
                        } else if (masterFiles.length > 0) {
                            this.props.actions.createTask({
                                resources: mergedList.map(item => item.path),
                                taskName: masterFiles[0].name
                            })
                        } else {
                            alert("There's no main file! There should be at least one blender" + (this.props.isMainNet ? " " : "or luxrender") + "file.")
                        }
                    })
            }
        }
        /**
         * We're not able to let people to choose directory and file at the same time.
         * @see https://electron.atom.io/docs/api/dialog/#dialogshowopendialogbrowserwindow-options-callback
         */
        dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory', 'multiSelections']
        }, onFileHandler)

    }

    _openDoc() {}

    _taskHints(engine, peers){
        if(!engine)
            return (<p>Golem is not started yet.</p>)
        if(!peers)
            return (<p>There's no connected node yet.</p>)
        return (<p>New Task</p>)
    }

    // <div className="top-titlebar">
    //     <div style={styling} className="draggable draggable--win"></div>
    //     <div>
    //         <span>Golem</span>
    //     </div>
    //     <div className="os__menu" role="menu">
    //         <span className="icon-minimize" onClick={::this._onMinimize} role="menuitem" tabIndex="0" aria-label="Close"/>
    //         <span className="icon-close" onClick={::this._onClose} role="menuitem" tabIndex="0" aria-label="Minimize"/>
    //     </div>
    // </div>

    render() {
        const {activeHeader, taskDetails, detail, isEngineOn, connectedPeers, isMainNet} = this.props
        let styling = {
            'WebkitAppRegion': 'drag'
        }
        return (
            <header className={`header ${activeHeader === 'secondary' ? "frame__screen" : ""}`}>
            <nav className={`nav ${isMainNet ? "nav-mainnet" : "nav-testnet"}`} role="menubar">
                <div style={styling} className="draggable draggable--other"></div>
                {activeHeader === 'main' &&
                    <div className="nav__list">
                        <img src={isMainNet ? mainNetLogo : testNetLogo} className="logo__header"/>
                    </div>
                }
                {activeHeader === 'main' &&
            <ul className="menu" role="menu">
                    <ReactTooltip overlayClassName="black" placement="bottom" trigger={['hover']} overlay={this._taskHints(isEngineOn, connectedPeers)} mouseEnterDelay={1} align={{
                offset: [0, 10],
            }} arrowContent={<div className="rc-tooltip-arrow-inner"></div>}>
                        <li className="menu__item" onClick={(isEngineOn && connectedPeers) ? ::this._onFileDialog : undefined}><span className="icon-add" role="menuitem" tabIndex="0" aria-label="New Task"/></li>
                    </ReactTooltip>
                    <ReactTooltip overlayClassName="black" placement="bottom" trigger={['hover']} overlay={<p>Docs</p>} mouseEnterDelay={1} align={{
                offset: [0, 10],
            }} arrowContent={<div className="rc-tooltip-arrow-inner"></div>}>
                        <li className="menu__item"><a href={DOCLINK}>
                            <span className="icon-doc" role="menuitem" tabIndex="0" aria-label="Documentation"/>
                            </a>
                        </li>
                    </ReactTooltip>
                    <ReactTooltip overlayClassName="black" placement="bottomRight" trigger={['hover']} overlay={<p>Settings</p>} mouseEnterDelay={1} align={{
                offset: [0, 10],
            }} arrowContent={<div className="rc-tooltip-arrow-inner"></div>}>
                        <li className="menu__item" onClick={this._navigateTo.bind(this, '/settings')} role="menuitem" tabIndex="0" aria-label="Settings"><span className="icon-settings"/></li>
                    </ReactTooltip>
                </ul>
            }
            {activeHeader === 'secondary' &&
            <div className="header__frame">
                    <div className="title">
                        <span>{taskDetails.name}</span>
                    </div>
                    <div className="info">
                        <span className="time">{taskDetails.status}</span>
                        <span className="amount__frame">{taskDetails.options && taskDetails.options.frame_count} {taskDetails.options && taskDetails.options.frame_count > 1 ? ' Frames' : ' Frame' }</span>
                    </div>
                    <div className="menu" role="menu">
                        <span className="menu__item" role="menuitem" tabIndex="0" aria-label="Completed Frames" onClick={this._handleMenu.bind(this, 'complete')}>Complete</span>
                        <span className={`menu__item ${(taskDetails.options && taskDetails.options.frame_count > 1) ? 'active' : ''}`} role="menuitem" tabIndex="0" aria-label="All Frames" onClick={this._handleMenu.bind(this, 'all')}>All</span>
                    </div>
                </div>
            }
            </nav>
            {activeHeader === 'main' &&
                <nav className="nav">
                    <ul className="nav__list" role="menu">
                        {activeHeader === 'main' && <li className="nav__item" onClick={this._navigateTo.bind(this, '/')} role="menuitem" tabIndex="0" aria-label="Network">Network</li>}
                        {activeHeader === 'main' && <li className="nav__item" onClick={this._navigateTo.bind(this, '/tasks')} role="menuitem" tabIndex="0" aria-label="Tasks">Tasks</li>}
                        {activeHeader === 'main' && <span className="selector"></span>}
                    </ul>
                </nav>
            }
            </header>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)