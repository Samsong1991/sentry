import React from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import Modal from 'react-bootstrap/lib/Modal';

import {t} from 'app/locale';
import SentryTypes from 'app/sentryTypes';
import Access from 'app/components/acl/access';
import Feature from 'app/components/acl/feature';
import Button from 'app/components/button';
import Tooltip from 'app/components/tooltip';
import {createSavedSearch} from 'app/actionCreators/savedSearches';
import {addLoadingMessage, clearIndicators} from 'app/actionCreators/indicator';
import {TextField} from 'app/components/forms';
import space from 'app/styles/space';
import withApi from 'app/utils/withApi';

class CreateSavedSearchButton extends React.Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    query: PropTypes.string.isRequired,
    organization: SentryTypes.Organization.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      isSaving: false,
      query: props.query,
      name: '',
      error: null,
    };
  }

  onSubmit = e => {
    const {api, organization} = this.props;

    e.preventDefault();

    this.setState({isSaving: true});

    addLoadingMessage(t('Saving Changes'));

    createSavedSearch(api, organization.slug, this.state.name, this.state.query)
      .then(data => {
        this.onToggle();
        this.setState({
          error: null,
          isSaving: false,
        });
        clearIndicators();
      })
      .catch(err => {
        let error = t('Unable to save your changes.');
        if (err.responseJSON && err.responseJSON.detail) {
          error = err.responseJSON.detail;
        }
        this.setState({
          error,
          isSaving: false,
        });
        clearIndicators();
      });
  };

  onToggle = event => {
    this.setState({
      isModalOpen: !this.state.isModalOpen,
    });

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  handleChangeName = val => {
    this.setState({name: val});
  };

  handleChangeQuery = val => {
    this.setState({query: val});
  };

  render() {
    const {isSaving, isModalOpen, error} = this.state;
    const {organization, query} = this.props;

    return (
      <Feature organization={organization} features={['org-saved-searches']}>
        <Access organization={organization} access={['org:write']}>
          <Tooltip title={t('Add to organization filter list')}>
            <StyledButton
              size="zero"
              borderless
              onClick={this.onToggle}
              data-test-id="save-current-search"
              icon="icon-add-to-list"
            />
          </Tooltip>
          <Modal show={isModalOpen} animation={false} onHide={this.onToggle}>
            <form onSubmit={this.onSubmit}>
              <div className="modal-header">
                <h4>{t('Save Current Search')}</h4>
              </div>

              <div className="modal-body">
                {this.state.error && (
                  <div className="alert alert-error alert-block">{error}</div>
                )}

                <p>{t('All team members will now have access to this search.')}</p>
                <TextField
                  key="name"
                  name="name"
                  label={t('Name')}
                  placeholder="e.g. My Search Results"
                  required={true}
                  onChange={this.handleChangeName}
                />
                <TextField
                  key="query"
                  name="query"
                  label={t('Query')}
                  value={query}
                  required={true}
                  onChange={this.handleChangeQuery}
                />
              </div>
              <div className="modal-footer">
                <Button
                  priority="default"
                  size="small"
                  disabled={isSaving}
                  onClick={this.onToggle}
                  style={{marginRight: space(1)}}
                >
                  {t('Cancel')}
                </Button>
                <Button priority="primary" size="small" disabled={isSaving}>
                  {t('Save')}
                </Button>
              </div>
            </form>
          </Modal>
        </Access>
      </Feature>
    );
  }
}

const StyledButton = styled(Button)`
  position: absolute;
  top: 9px;
  right: 52px;

  & svg {
    color: ${p => p.theme.gray6};
  }
  &:hover svg {
    color: ${p => p.theme.gray3};
  }
`;

export default withApi(CreateSavedSearchButton);
