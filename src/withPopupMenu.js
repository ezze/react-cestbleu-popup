import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import Popup from './Popup';

const withPopupMenu = (options = {}) => {
  const {
    id,
    items,
    adjustRight = false,
    adjustBottom = false,
    minHorizontalGap = 5,
    minVerticalGap = 5
  } = options;

  return WrappedComponent => {
    class ComponentWithPopup extends Component {
      state = {
        open: false,
        offsetX: 0,
        offsetY: 0,
        items: null
      }

      wrappedRef = React.createRef();
      popupRef = React.createRef();

      constructor(props) {
        super(props);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
      }

      componentDidMount() {
        document.addEventListener('contextmenu', this.onContextMenu);
      }

      componentDidUpdate(prevProps, prevState) {
        if (!prevState.open && this.state.open) {
          this.adjustPopup();
        }
      }

      componentWillUnmount() {
        document.removeEventListener('contextmenu', this.onContextMenu);
      }

      getWrappedRef() {
        const { forwardedRef } = this.props;
        return forwardedRef ? forwardedRef : this.wrappedRef;
      }

      openPopup(offsetX, offsetY, items = null) {
        this.setState({ open: true, offsetX, offsetY, items });
      }

      closePopup() {
        this.setState({ open: false, offsetX: 0, offsetY: 0, items: null });
      }

      adjustPopup() {
        const popup = this.popupRef.current;
        if (!popup) {
          return;
        }

        const { popupElement } = popup;
        const { offsetX, offsetY } = this.state;

        if (adjustRight) {
          if (offsetX + popupElement.offsetWidth > document.body.offsetWidth - minHorizontalGap) {
            this.setState({ offsetX: document.body.offsetWidth - popupElement.offsetWidth - minHorizontalGap });
          }
        }

        if (adjustBottom) {
          if (offsetY + popupElement.offsetHeight > document.body.offsetHeight - minVerticalGap) {
            this.setState({ offsetY: document.body.offsetHeight - popupElement.offsetHeight - minVerticalGap });
          }
        }
      }

      onContextMenu(event) {
        event.preventDefault();

        let { popupMenuItems } = this.props;
        if (!popupMenuItems) {
          popupMenuItems = items;
        }

        const wrappedElement = findDOMNode(this.getWrappedRef().current);
        const path = event.composedPath();
        let analyze = true;

        for (let i = 0; analyze && i < path.length; i++) {
          const element = path[i];
          if (!(element instanceof HTMLElement)) {
            continue;
          }

          if (element === wrappedElement) {
            if (Array.isArray(popupMenuItems)) {
              this.openPopup(event.clientX, event.clientY, popupMenuItems);
              return;
            }
            analyze = false;
          }

          if (typeof popupMenuItems !== 'function') {
            continue;
          }

          const menuOptions = {};
          Object.keys(element.dataset).forEach(name => {
            const popupNameMatch = name.match(/^popup(([A-Z])(.*))$/);
            if (popupNameMatch === null) {
              return;
            }
            let value = element.dataset[name];
            if (/^\d+$/.test(value)) {
              value = parseInt(value, 10);
            }
            const popupName = `${popupNameMatch[2].toLowerCase()}${popupNameMatch[3]}`;
            menuOptions[popupName] = value;
          });
          if (Object.keys(menuOptions).length === 0) {
            continue;
          }

          const items = popupMenuItems(menuOptions);
          if (Array.isArray(items) && items.length > 0) {
            this.openPopup(event.x, event.y, items);
            return;
          }
        }
      }

      render() {
        const { popupMenuId, ...props } = this.props;
        const popupId = popupMenuId || id || `popup-${Math.random()}`;
        delete props.popupMenuItems;
        return (
          <>
            <WrappedComponent
              ref={this.getWrappedRef()}
              openPopup={this.openPopup}
              closePopup={this.closePopup}
              {...props}
            />
            <Popup
              id={popupId}
              ref={this.popupRef}
              type="menu"
              isOpen={this.state.open}
              offsetX={this.state.offsetX}
              offsetY={this.state.offsetY}
              items={this.state.items || []}
              border={true}
              close={this.closePopup}
            />
          </>
        );
      }
    }

    return React.forwardRef((props, ref) => {
      return (
        <ComponentWithPopup {...props} forwardedRef={ref} />
      );
    });
  };
};

export default withPopupMenu;
