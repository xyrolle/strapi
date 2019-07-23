/**
 *
 * RelationFormGroup
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get, isEmpty } from 'lodash';

import pluginId from '../../pluginId';

import BodyModal from '../../components/BodyModal';
import ButtonModalPrimary from '../../components/ButtonModalPrimary';
import ButtonModalSecondary from '../../components/ButtonModalSecondary';
import ButtonModalSuccess from '../../components/ButtonModalSuccess';
import FooterModal from '../../components/FooterModal';
import HeaderModal from '../../components/HeaderModal';
import HeaderModalNavContainer from '../../components/HeaderModalNavContainer';
import HeaderModalTitle from '../../components/HeaderModalTitle';
import HeaderNavLink from '../../components/HeaderNavLink';
import RelationNaturePicker from '../../components/RelationNaturePicker';
import RelationBox from '../../components/RelationBox';
import RelationsWrapper from '../../components/RelationsWrapper';
import WrapperModal from '../../components/WrapperModal';

import Icon from '../../assets/icons/icon_type_ct.png';
import IconGroup from '../../assets/icons/icon_type_groups.png';

const NAVLINKS = [{ id: 'base', custom: 'relation' }, { id: 'advanced' }];

class RelationFormGroup extends React.Component {
  // eslint-disable-line react/prefer-stateless-function

  state = { didCheckErrors: false, formErrors: {}, showForm: false };

  getFormErrors = () => {
    const {
      actionType,
      alreadyTakenAttributes,
      attributeToEditName,
      modifiedData,
    } = this.props;
    const formValidations = {
      name: { required: true, unique: true },
      key: { required: true, unique: true },
    };

    const alreadyTakenAttributesUpdated = alreadyTakenAttributes.filter(
      attribute => {
        if (actionType === 'edit') {
          return (
            attribute !== attributeToEditName && attribute !== modifiedData.key
          );
        }

        return attribute !== attributeToEditName;
      }
    );

    let formErrors = {};

    if (modifiedData.name === modifiedData.key) {
      formErrors = { key: [{ id: `${pluginId}.error.attribute.key.taken` }] };
    }

    formErrors = Object.keys(formValidations).reduce((acc, current) => {
      const { required, unique } = formValidations[current];
      const value = modifiedData[current];

      if (required === true && !value) {
        acc[current] = [{ id: `${pluginId}.error.validation.required` }];
      }

      if (unique === true && alreadyTakenAttributesUpdated.includes(value)) {
        acc[current] = [{ id: `${pluginId}.error.attribute.key.taken` }];
      }

      return acc;
    }, formErrors);

    this.setState(prevState => ({
      didCheckErrors: !prevState.didCheckErrors,
      formErrors,
    }));

    return formErrors;
  };

  getIcon = () => {
    const { featureType } = this.props;

    return featureType === 'model' ? Icon : IconGroup;
  };

  handleCancel = () => {
    const { push } = this.props;

    push({ search: '' });
  };

  handleChangeRelationTarget = group => {
    const {
      actionType,
      featureToEditName,
      onChangeRelationTarget,
    } = this.props;

    onChangeRelationTarget(group, featureToEditName, actionType === 'edit');
  };

  handleOnClosed = () => {
    const { onCancel } = this.props;

    onCancel();
    this.setState({ formErrors: {}, showForm: false }); // eslint-disable-line react/no-unused-state
  };

  handleOnOpened = () => {
    const {
      actionType,
      attributeToEditName,
      isUpdatingTemporary,
      features,
      featureToEditName,
      setTempAttribute,
    } = this.props;
    const [{ name, source }] = features;
    const target = actionType === 'edit' ? featureToEditName : name;

    setTempAttribute(
      target,
      isUpdatingTemporary,
      source,
      attributeToEditName,
      actionType === 'edit'
    );

    this.setState({ showForm: true });
  };

  handleToggle = () => {
    const { push } = this.props;

    push({ search: '' });
  };

  handleGoTo = to => {
    const { emitEvent } = this.context;
    const { actionType, attributeToEditName, push } = this.props;
    const attributeName =
      actionType === 'edit' ? `&attributeName=${attributeToEditName}` : '';

    if (to === 'advanced') {
      emitEvent('didSelectContentTypeFieldSettings');
    }

    push({
      search: `modalType=attributeForm&attributeType=relation&settingType=${to}&actionType=${actionType}${attributeName}`,
    });
  };

  handleSubmit = e => {
    e.preventDefault();

    if (isEmpty(this.getFormErrors())) {
      this.submit();
    }
  };

  handleSubmitAndContinue = e => {
    e.preventDefault();

    if (isEmpty(this.getFormErrors())) {
      this.submit(true);
    }
  };

  renderNavLink = (link, index) => {
    const { activeTab } = this.props;

    return (
      <HeaderNavLink
        isActive={activeTab === link.id}
        key={link.id}
        {...link}
        onClick={this.handleGoTo}
        nextTab={index === NAVLINKS.length - 1 ? 0 : index + 1}
      />
    );
  };

  submit = (shouldContinue = false) => {
    const { actionType, onSubmit, onSubmitEdit } = this.props;

    if (actionType === 'edit') {
      onSubmitEdit(shouldContinue);
    } else {
      console.log('SUUUBMIT');
      onSubmit(shouldContinue);
    }
  };

  renderRelationForm = () => {
    const {
      featureToEditName,
      modifiedData: { key, name, nature, plugin, target },
      features,
      onChange,
      onChangeRelationNature,
      source,
    } = this.props;
    const { formErrors, didCheckErrors } = this.state;
    return (
      <RelationsWrapper>
        <RelationBox
          autoFocus
          didCheckErrors={didCheckErrors}
          errors={get(formErrors, 'name', [])}
          featureName={featureToEditName}
          main
          onChange={onChange}
          source={source}
          value={name}
        />
        <RelationNaturePicker
          featureName={featureToEditName}
          nature={nature}
          name={name}
          target={target}
          onClick={onChangeRelationNature}
        />
        <RelationBox
          autoFocus
          didCheckErrors={didCheckErrors}
          errors={get(formErrors, 'key', [])}
          features={features}
          nature={nature}
          onChange={onChange}
          onClick={this.handleChangeRelationTarget}
          plugin={plugin}
          selectedFeature={target}
          source={source}
          value={key}
        />
      </RelationsWrapper>
    );
  };

  render() {
    const { actionType, activeTab, attributeToEditName, isOpen } = this.props;
    const { showForm } = this.state;
    const titleContent =
      actionType === 'create' ? 'relation' : attributeToEditName;
    const content =
      activeTab === 'base' || !activeTab
        ? this.renderRelationForm()
        : this.renderAdvancedSettings();

    return (
      <WrapperModal
        isOpen={isOpen}
        onClosed={this.handleOnClosed}
        onOpened={this.handleOnOpened}
        onToggle={this.handleToggle}
      >
        <HeaderModal>
          <section>
            <HeaderModalTitle>
              <img src={this.getIcon()} alt="ct" />
              <span>{titleContent}</span>
            </HeaderModalTitle>
          </section>
          <section>
            <HeaderModalTitle>
              <FormattedMessage
                id={`${pluginId}.popUpForm.${actionType || 'create'}`}
              />
            </HeaderModalTitle>
            <div className="settings-tabs">
              <HeaderModalNavContainer>
                {NAVLINKS.map(this.renderNavLink)}
              </HeaderModalNavContainer>
            </div>
            <hr />
          </section>
        </HeaderModal>
        <form onSubmit={this.handleSubmitAndContinue}>
          <BodyModal>{showForm && content}</BodyModal>
          <FooterModal>
            <section>
              <ButtonModalPrimary
                message={`${pluginId}.form.button.add`}
                type="submit"
                add
              />
            </section>
            <section>
              <ButtonModalSecondary
                message={`${pluginId}.form.button.cancel`}
                onClick={this.handleCancel}
              />
              <ButtonModalSuccess
                message={`${pluginId}.form.button.done`}
                type="button"
                onClick={this.handleSubmit}
              />
            </section>
          </FooterModal>
        </form>
      </WrapperModal>
    );
  }
}

RelationFormGroup.contextTypes = {
  emitEvent: PropTypes.func,
};

RelationFormGroup.defaultProps = {
  actionType: 'create',
  activeTab: 'base',
  featureType: 'model',
  features: [],
  featuereToEditName: '',
  isOpen: false,
  isUpdatingTemporary: false,
  onChange: () => {},
  onChangeRelationTarget: () => {},
  onSubmit: () => {},
  source: null,
};

RelationFormGroup.propTypes = {
  actionType: PropTypes.string,
  activeTab: PropTypes.string,
  features: PropTypes.array,
  featureType: PropTypes.string,
  featuereToEditName: PropTypes.string,
  isOpen: PropTypes.bool,
  isUpdatingTemporary: PropTypes.bool,
  modifiedData: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onChangeRelationTarget: PropTypes.func,
  onSubmit: PropTypes.func,
  push: PropTypes.func.isRequired,
  source: PropTypes.string,
};

export default RelationFormGroup;
