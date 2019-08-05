import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import isFunction from 'lodash.isfunction';
import isObject from 'lodash.isobject';

import {
  POPUP_ALIGN_LEFT,
  POPUP_ALIGN_RIGHT
} from './constants';

import Popup from './Popup';

class PopupItem extends Component {
  state = {
    isSubmenuOpen: false
  };

  constructor(props) {
    super(props);

    this.closeMenu = this.closeMenu.bind(this);
    this.closeSubmenu = this.closeSubmenu.bind(this);
    this.getLabel = this.getLabel.bind(this);
    this.onDelimiterClick = this.onDelimiterClick.bind(this);
    this.onSubmenuClick = this.onSubmenuClick.bind(this);
    this.onDisabledClick = this.onDisabledClick.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  getData() {
    const { popupData } = this.props;
    return isObject(popupData) ? popupData : {};
  }

  openSubmenu() {
    this.setState({
      isSubmenuOpen: true
    });
  }

  closeSubmenu() {
    if (this.state.isSubmenuOpen) {
      this.setState({
        isSubmenuOpen: false
      });
    }
  }

  closeMenu() {
    this.props.close();
  }

  executeCommand() {
    const { command } = this.props;
    if (isFunction(command)) {
      command(this.getData());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPopupOpen && !nextProps.isPopupOpen) {
      this.closeSubmenu();
    }
  }

  getLabel() {
    const { t, popupId, id, label } = this.props;

    let itemLabel = t(`${popupId}.${id}`, {
      defaultValue: ''
    });

    if (!itemLabel) {
      itemLabel = t(`${popupId}.${id}.label`, {
        defaultValue: label
      });
    }

    return itemLabel;
  }

  render() {
    const { type } = this.props;

    switch (type) {
      case 'delimiter': return this.renderDelimiter();
      case 'submenu': return this.renderSubmenuItem();
      case 'command': default: return this.renderItem();
    }
  }

  renderDelimiter() {
    return (
      <li
        data-ref-id={this.props.refId}
        className="popup-item popup-item-delimiter"
        onClick={this.onDelimiterClick}>
      </li>
    );
  }

  renderSubmenuItem() {
    const { refId, popupId, popupBorder, popupAlign, popupData, id, enabled, active, items } = this.props;
    const { isSubmenuOpen } = this.state;

    const isDisabled = isFunction(enabled) ? !enabled(this.getData()) : false;
    const isActive = isFunction(active) ? active(this.getData()) : active;

    const className = classNames({
      'popup-item': true,
      'popup-item-disabled': isDisabled,
      'popup-item-active': isActive
    });

    const onClick = isDisabled ? this.onDisabledClick : this.onSubmenuClick;

    const link = popupAlign === POPUP_ALIGN_RIGHT ? (
      <a onClick={onClick}>
        <i className="popup-item-caret fa fa-caret-left"></i>
        <span>{this.getLabel()}</span>
      </a>
    ) : (
      <a onClick={onClick}>
        <span>{this.getLabel()}</span>
        <i className="popup-item-caret fa fa-caret-right"></i>
      </a>
    );

    return (
      <li data-ref-id={refId} className={className}>
        {link}
        <div className="popup-item-submenu">
          <Popup
            id={`${popupId}.${id}`}
            isOpen={isSubmenuOpen}
            border={popupBorder}
            portal={false}
            align={popupAlign}
            close={this.closeMenu}
            type="menu"
            items={items}
            data={popupData}
          />
        </div>
      </li>
    );
  }

  renderItem() {
    const { refId, popupAlign, enabled, active } = this.props;

    const isDisabled = isFunction(enabled) ? !enabled(this.getData()) : false;
    const isActive = isFunction(active) ? active(this.getData()) : active;

    const className = classNames({
      'popup-item': true,
      'popup-item-disabled': isDisabled,
      'popup-item-active': isActive
    });

    const onClick = isDisabled ? this.onDisabledClick : this.onClick;

    const link = popupAlign === POPUP_ALIGN_RIGHT ? (
      <a onClick={onClick}>
        <span></span>
        {this.getLabel()}
      </a>
    ) : (
      <a onClick={onClick}>
        {this.getLabel()}
      </a>
    );

    return (
      <li data-ref-id={refId} className={className}>
        {link}
      </li>
    );
  }

  onDelimiterClick(event) {
    event.stopPropagation();
  }

  onSubmenuClick(event) {
    event.stopPropagation();
    if (this.state.isSubmenuOpen) {
      this.closeSubmenu();
    }
    else {
      const { id, closeSiblingSubmenus } = this.props;
      closeSiblingSubmenus(id);
      this.openSubmenu();
    }
  }

  onDisabledClick(event) {
    event.stopPropagation();
  }

  onClick(event) {
    event.stopPropagation();
    this.executeCommand();
    this.closeMenu();
  }
}

PopupItem.defaultProps = {
  type: 'command',
  popupData: {},
  popupBorder: false,
  popupAlign: POPUP_ALIGN_LEFT,
  isPopupOpen: false,
  active: false
};

PopupItem.propTypes = {
  type: PropTypes.string.isRequired,
  refId: PropTypes.string.isRequired,
  popupId: PropTypes.string.isRequired,
  popupData: PropTypes.object.isRequired,
  popupBorder: PropTypes.bool.isRequired,
  popupAlign: PropTypes.string.isRequired,
  isPopupOpen: PropTypes.bool.isRequired,
  id: PropTypes.string,
  label: PropTypes.string,
  enabled: PropTypes.func,
  active: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]).isRequired,
  command: PropTypes.func,
  items: PropTypes.array,
  close: PropTypes.func.isRequired,
  closeSiblingSubmenus: PropTypes.func.isRequired
};

export default withTranslation('popup', { withRef: true })(PopupItem);
