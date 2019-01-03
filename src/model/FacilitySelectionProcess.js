import _ from "lodash";

const nullAssessmentToolMode = {name: "Select Program"};
const nullAssessmentTool = {name: "Select Assessment Tool"};
const nullChecklist = {name: "Select Checklist"};
const nullState = {name: "Select State"};
const nullDistrict = {name: "Select District"};
const nullFacilityType = {name: "Select Facility Type"};
const nullAssessmentType = {name: "Select Assessment Type"};
const nullFacility = {name: "Select Facility"};

class FacilitySelectionProcess {
    static empty() {
        return new FacilitySelectionProcess();
    }

    static clone(facilitySelectionProcess) {
        return Object.assign(new FacilitySelectionProcess(), facilitySelectionProcess);
    }

    start(getAllStates, getAllFacilityTypes, getAllAssessmentToolModes, getAllAssessmentTypes) {
        return getAllStates()
            .then((states) => {
                this.states = FacilitySelectionProcess._getSortedList(states, nullState);
                this.selectedState = nullState;
            })
            .then(getAllFacilityTypes)
            .then((facilityTypes) => {
                this.facilityTypes = FacilitySelectionProcess._getSortedList(facilityTypes, nullFacilityType);
                this.selectedFacilityType = nullFacilityType;
            })
            .then(getAllAssessmentTypes)
            .then((assessmentTypes) => {
                this.assessmentTypes = FacilitySelectionProcess._getSortedList(assessmentTypes, nullAssessmentType);
                this.selectedAssessmentType = nullAssessmentType;
            })
            .then(getAllAssessmentToolModes)
            .then((assessmentToolModes) => {
                this.assessmentToolModes = FacilitySelectionProcess._getSortedList(assessmentToolModes, nullAssessmentToolMode);
                this.selectedAssessmentToolMode = nullAssessmentToolMode;

                this.assessmentTools = [nullAssessmentTool];
                this.selectedAssessmentTool = nullAssessmentTool;

                this.checklists = [nullChecklist];
                this.selectedChecklist = nullChecklist;

                this.districts = [nullDistrict];
                this.selectedDistrict = nullDistrict;

                this.facilities = [nullFacility];
                this.selectedFacility = nullFacility;

                this.facilityName = '';
                this.resetUploadState();
                return this;
            });
    }

    get loading() {
        return _.isNil(this.assessmentToolModes);
    }

    static isSubmittable(facilitySelectionProcess) {
        let submittable = !(_.isNil(facilitySelectionProcess.selectedAssessmentTool) || _.isNil(facilitySelectionProcess.selectedAssessmentType) || _.isNil(facilitySelectionProcess.uploadFile));
        return submittable && (!_.isNil(facilitySelectionProcess.selectedFacility) || !_.isEmpty(facilitySelectionProcess.facilityName));
    }

    static isUpdatable(facilitySelectionProcess) {
        return !_.isEmpty(facilitySelectionProcess.facilityAssessmentUuid);
    }

    static _getSortedList(objects, nullObject) {
        let sortedObjects = _.sortBy(objects, (obj) => obj.name);
        sortedObjects.splice(0, 0, nullObject);
        return sortedObjects;
    }

    setSelectedAssessmentToolMode(assessmentToolModeName, getAssessmentTools) {
        this.selectedAssessmentToolMode = _.find(this.assessmentToolModes, (assessmentToolMode) => assessmentToolMode.name === assessmentToolModeName);
        if (assessmentToolModeName === nullAssessmentToolMode.name) {
            return new Promise(() => this);
        } else {
            return getAssessmentTools(assessmentToolModeName).then((assessmentTools) => {
                this.assessmentTools = FacilitySelectionProcess._getSortedList(assessmentTools, nullAssessmentTool);
                this.selectedAssessmentTool = nullAssessmentTool;
                return this;
            });
        }
    }

    setSelectedAssessmentTool(assessmentToolName, getChecklists) {
        this.selectedAssessmentTool = _.find(this.assessmentTools, (assessmentTool) => assessmentTool.name === assessmentToolName);
        return getChecklists(assessmentToolName).then((checklists) => {
            this.checklists = FacilitySelectionProcess._getSortedList(checklists, nullChecklist);
            this.selectedChecklist = nullChecklist;
            return this;
        });
    }

    setChecklist(checklistName) {
        this.selectedChecklist = _.find(this.checklists, (checklist) => checklist.name === checklistName);
        return this;
    }

    setSelectedState(stateName, getDistricts) {
        this.selectedDistrict = nullDistrict;
        this.selectedFacility = nullFacility;
        this.selectedState = _.find(this.states, (state) => state.name === stateName);

        if (this.selectedState.name === nullState.name) {
            this.districts = [nullDistrict];
            return new Promise(() => this);
        }
        return getDistricts(stateName).then((districts) => {
            this.districts = FacilitySelectionProcess._getSortedList(districts, nullDistrict);
        }).then(() => this);
    }

    setSelectedDistrict(districtName, getFacilities) {
        this.selectedDistrict = _.find(this.districts, (district) => district.name === districtName);
        this.selectedFacility = nullFacility;

        if (FacilitySelectionProcess.isNullDistrict(districtName)) {
            this.facilities = [nullFacility];
            return new Promise(() => this);
        } else
            return getFacilities(districtName, this.getFacilityTypeName()).then((facilities) => {
                this.facilities = FacilitySelectionProcess._getSortedList(facilities, nullFacility);
                this.selectedFacility = nullFacility;
                return this;
            });
    }

    setFacilityType(facilityTypeName, getFacilities) {
        this.selectedFacilityType = _.find(this.facilityTypes, (facilityType) => facilityType.name === facilityTypeName);
        if (facilityTypeName === nullFacilityType.name || this.selectedDistrict.name === nullDistrict.name) {
            return new Promise(() => this);
        } else {
            return getFacilities(this.selectedDistrict.name, facilityTypeName).then((facilities) => {
                this.facilities = FacilitySelectionProcess._getSortedList(facilities, nullFacility);
                this.selectedFacility = nullFacility;
                return this;
            });
        }
    }

    setAssessmentType(assessmentTypeName) {
        this.selectedAssessmentType = _.find(this.assessmentTypes, (assessmentType) => assessmentType.name === assessmentTypeName);
        return this;
    }

    setFreeTextFacilityName(facilityName) {
        this.facilityName = facilityName;
        this.selectedFacility = nullFacility;
        return this;
    }

    static isNullDistrict(districtName) {
        return nullDistrict.name === districtName;
    }

    getFacilityTypeName() {
        return this.selectedFacilityType === nullFacilityType ? undefined : this.selectedFacilityType.name;
    }

    setFacility(facilityName) {
        this.facilityName = '';
        this.selectedFacility = _.find(this.facilities, (facility) => facility.name === facilityName);
        return this;
    }

    uploadFileSelected(file) {
        this.uploadFile = file;
        return this;
    }

    submitNewAssessment(submit) {
        return this._handleSubmitResponse(submit(this.selectedAssessmentTool["uuid"], this.selectedChecklist["uuid"], this.selectedAssessmentType["uuid"], this.selectedFacility["uuid"], this.facilityName, this.uploadFile));
    }

    _handleSubmitResponse(promise) {
        return promise.then((response) => {
            this.uploadStatus = 'Completed';
            this.assessmentUploadResponse = response;
            return this;
        }).catch((error) => {
            this.error = error;
            this.uploadStatus = 'Completed';
            this.assessmentUploadResponse = undefined;
            return this;
        });
    }

    setFacilityAssessmentUuid(uuid) {
        this.facilityAssessmentUuid = uuid;
        return this;
    }

    submitExistingAssessment(submit) {
        return this._handleSubmitResponse(submit(this.facilityAssessmentUuid, this.uploadFile));
    }

    startUpload() {
        this.uploadStatus = 'Uploading';
        return this;
    }

    static uploadFailed(facilitySelectionProcess) {
        return !_.isNil(facilitySelectionProcess.error) || (!_.isNil(facilitySelectionProcess.assessmentUploadResponse) && (facilitySelectionProcess.assessmentUploadResponse["checkpointInErrors"].length !== 0));
    }

    static uploadErrorMessage(facilitySelectionProcess) {
        if (facilitySelectionProcess.error)
            return facilitySelectionProcess.error;

        return facilitySelectionProcess.assessmentUploadResponse["checkpointInErrors"];
    }

    static assessmentUploadMessage(facilitySelectionProcess) {
        return `Please retain this token in case you want to overwrite this assessment by re-uploading this file - ${facilitySelectionProcess.assessmentUploadResponse["facilityAssessment"]["uuid"]}`;
    }

    uploadProcessCompleted() {
        this.resetUploadState();
        return this;
    }

    resetUploadState() {
        this.uploadFile = this.error = this.assessmentUploadResponse = undefined;
        this.facilityAssessmentUuid = undefined;
        this.uploadStatus = 'NotUploading';
    }
}

export default FacilitySelectionProcess;
