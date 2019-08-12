import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import gator from 'gator';
import classNames from 'classnames';

import {
  POPUP_ALIGN_LEFT,
  POPUP_ALIGN_RIGHT
} from './constants';

import PopupItem from './PopupItem';

class Popup extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    offsetX: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    offsetY: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    portal: PropTypes.bool.isRequired,
    border: PropTypes.bool.isRequired,
    align: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    items: PropTypes.array
  };

  static defaultProps = {
    offsetX: 0,
    offsetY: 0,
    portal: true,
    border: false,
    align: POPUP_ALIGN_LEFT,
    type: 'window',
    items: []
  };

  constructor(props) {
    super(props);

    this.capturePopupElement = this.capturePopupElement.bind(this);
    this.capturePopupItemElement = this.capturePopupItemElement.bind(this);
    this.closeSiblingSubmenus = this.closeSiblingSubmenus.bind(this);
    this.onOutsideMouseClick = this.onOutsideMouseClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  capturePopupElement(element) {
    this.popupElement = element;
  }

  capturePopupItemElement(element) {
    if (element === null) {
      return;
    }

    if (!this.popupItemElements) {
      this.popupItemElements = {};
    }

    const popupItemElement = typeof element.getWrappedInstance === 'function' ? element.getWrappedInstance() : element;
    const node = ReactDOM.findDOMNode(popupItemElement);
    const refId = node.getAttribute('data-ref-id');
    this.popupItemElements[refId] = popupItemElement;
  }

  componentDidMount() {
    gator(document).on('click', this.onOutsideMouseClick);
    gator(document).on('touchstart', this.onOutsideMouseClick);
    gator(document).on('contextmenu', this.onOutsideMouseClick);
    gator(document).on('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    gator(document).off('click', this.onOutsideMouseClick);
    gator(document).off('touchstart', this.onOutsideMouseClick);
    gator(document).off('contextmenu', this.onOutsideMouseClick);
    gator(document).off('keydown', this.onKeyDown);
  }

  close() {
    this.props.close();
  }

  closeSiblingSubmenus(exceptionId) {
    if (!this.popupItemElements) {
      return;
    }

    const ids = Object.keys(this.popupItemElements);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (id === exceptionId) {
        continue;
      }

      const popupItemElement = this.popupItemElements[id];
      if (popupItemElement.props.type === 'submenu') {
        popupItemElement.closeSubmenu();
      }
    }
  }

  render() {
    const { id, isOpen, portal, border, align, type } = this.props;

    const className = classNames({
      popup: true,
      'popup-portal': portal,
      'popup-border': border,
      [`popup-align-${align}`]: true,
      'popup-window': type === 'window',
      'popup-menu': type === 'menu',
      'popup-open': isOpen
    });

    const style = {};
    if (isOpen) {
      const { offsetX, offsetY } = this.props;
      if (align === POPUP_ALIGN_RIGHT) {
        style.right = isFinite(offsetX) || typeof offsetX === 'string' ? offsetX : Popup.defaultProps.offsetX;
      }
      else {
        style.left = isFinite(offsetX) || typeof offsetX === 'string' ? offsetX : Popup.defaultProps.offsetX;
      }
      style.top = isFinite(offsetY) || typeof offsetY === 'string' ? offsetY : Popup.defaultProps.offsetY;
    }

    let content;
    if (type === 'menu') {
      const { items, close } = this.props;
      const popupItems = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const refId = item.id ? item.id : `item-${i}`;
        popupItems.push(
          <PopupItem
            key={refId}
            refId={refId}
            ref={this.capturePopupItemElement}
            popupId={id}
            popupBorder={border}
            popupAlign={align}
            isPopupOpen={isOpen}
            {...item}
            close={close}
            closeSiblingSubmenus={this.closeSiblingSubmenus}
          />
        );
      }

      content = (
        <ul ref={this.capturePopupElement} className={className} style={style}>
          {popupItems}
        </ul>
      );
    }
    else {
      content = (
        <div ref={this.capturePopupElement} className={className} style={style}>
          {this.props.children}
        </div>
      );
    }

    return portal ? ReactDOM.createPortal(content, document.body) : content;
  }

  onOutsideMouseClick(event) {
    const { isOpen } = this.props;
    if (!isOpen || this.popupElement === event.target || this.popupElement.contains(event.target)) {
      return;
    }
    this.close();
  }

  onKeyDown(event) {
    const { isOpen } = this.props;
    if (!isOpen || event.keyCode !== 27) {
      return;
    }
    this.close();
  }
}

export default Popup;
