// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Accordion, Button, Card, List } from 'semantic-ui-react';
import DappIcon from '@parity/ui/lib/DappIcon';
import methodGroups, { allMethods } from '@parity/mobx/lib/methodGroups';
import { FormattedMessage } from 'react-intl';

import messages from '../messages';
import styles from './DappCard.css';

export class DappCard extends Component {
  static propTypes = {
    dapp: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string
    }).isRequired,
    dappsPermissionsStore: PropTypes.object.isRequired,
    editingMode: PropTypes.bool,
    onEdit: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired
  };

  handleEdit = () => this.props.onEdit(this.props.dapp.id);

  handleToggle = (_, { name: method }) => {
    this.props.onToggle(method, this.props.dapp.id);
  };

  renderEditingMode = () => {
    const { dapp, dappsPermissionsStore } = this.props;

    const panels = Object.keys(methodGroups).map(group => ({
      title: {
        key: `${dapp.id}-${group}-editing-title`,
        active: true,
        content: <FormattedMessage {...messages[group]} />
      },
      content: {
        key: `${dapp.id}-${group}-editing-content`,
        active: true,
        content: (
          <List className={styles.editList}>
            {methodGroups[group].methods.map(method => (
              <List.Item
                key={method}
                name={method}
                onClick={this.handleToggle}
                className={styles.editListItem}
              >
                <List.Icon
                  name={
                    dappsPermissionsStore.hasAppPermission(method, dapp.id)
                      ? 'checkmark box'
                      : 'square outline'
                  }
                />
                {method}
              </List.Item>
            ))}
          </List>
        )
      }
    }));

    return <Accordion panels={panels} />;
  };

  renderViewMode = () => {
    const { dappsPermissionsStore, dapp } = this.props;

    if (
      !allMethods.some(method =>
        dappsPermissionsStore.hasAppPermission(method, dapp.id)
      )
    ) {
      return (
        <div className={styles.noAllowedMethods}>
          <FormattedMessage
            id="dapps.methods.noAllowedMethods"
            defaultMessage="No allowed methods"
          />
        </div>
      );
    }

    const panels = Object.keys(methodGroups)
      .filter((
        group // Only display method groups that have at least one method
      ) =>
        methodGroups[group].methods.some(method =>
          dappsPermissionsStore.hasAppPermission(method, dapp.id)
        )
      )
      .map(group => ({
        title: {
          key: `${dapp.id}-${group}-title`,
          content: <FormattedMessage {...messages[group]} />
        },
        content: {
          key: `${dapp.id}-${group}-content`,
          content: (
            <List bulleted className={styles.list}>
              {methodGroups[group].methods.map(
                method =>
                  dappsPermissionsStore.hasAppPermission(method, dapp.id) && (
                    <List.Item key={method}>{method}</List.Item>
                  )
              )}
            </List>
          )
        }
      }));

    return <Accordion panels={panels} />;
  };

  render() {
    const { dapp, editingMode } = this.props;

    return (
      <Card>
        <Card.Content>
          <Button
            floated="right"
            basic
            size="mini"
            icon={editingMode ? 'remove' : 'edit'}
            className={styles.editButton}
            onClick={this.handleEdit}
          />
          <DappIcon
            app={dapp}
            className={`ui image centered ${styles.picture}`}
            size="small"
          />
          <Card.Header>{dapp.name}</Card.Header>
          <Card.Meta>{dapp.description}</Card.Meta>
          <Card.Description>
            {editingMode ? this.renderEditingMode() : this.renderViewMode()}
          </Card.Description>
        </Card.Content>
      </Card>
    );
  }
}

export default inject('dappsPermissionsStore')(observer(DappCard));
