import React from 'react';
import {Alert, Button, Modal} from "react-bootstrap";
import BaseComponent from "./BaseComponent";
import FacilitySelectionProcess from "../model/FacilitySelectionProcess";
import PropTypes from 'prop-types';

export default class UploadStatusComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    renderUploadView() {
        switch (this.props.state.uploadStatus) {
            case 'Uploading':
                return <Modal.Dialog>
                    <Modal.Header><Modal.Title>Uploading...</Modal.Title></Modal.Header></Modal.Dialog>;
            case 'Completed':
                return this.wrapInModal('Assessment uploaded successfully', <p>{FacilitySelectionProcess.assessmentUploadMessage(this.props.state)}</p>);
        }
        return null;
    }

    wrapInModal(title, body) {
        return <Modal.Dialog>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>{ body }</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" onClick={() => this.props.confirmUpload()}>Close</Button>
                </Modal.Footer>
            </Modal.Dialog>;
    }

    renderUploadErrorMessage(errorMsg) {
        if (Array.isArray(errorMsg)) {
            return <ul>{
                errorMsg.map((checkpointInError) =>
                    <li>
                        { `"${checkpointInError["checkpoint"]}"` }
                        <span style={{color: 'red'}}>
                        {` not found in ${checkpointInError["measurableElementReference"]}`}
                    </span>
                    </li>
                )
            }</ul>;
        } else if (errorMsg instanceof Object)
            return <div>{ JSON.stringify(errorMsg, null, '  ') }</div>;
    }

    render() {
        return FacilitySelectionProcess.uploadFailed(this.props.state) ?
            this.wrapInModal('Error in uploading',
                this.renderUploadErrorMessage(FacilitySelectionProcess.uploadErrorMessage(this.props.state)))
            :
            this.renderUploadView();
    }
};

UploadStatusComponent.propTypes = {
    state: PropTypes.object.isRequired,
    confirmUpload: PropTypes.func.isRequired
};
