import React, { useState, useEffect } from 'react';
import styles from './App.module.scss';
import Classnames from 'classnames';
import Axios from 'axios'; // used to communicate with backend
import { io, Socket } from 'socket.io-client';
import LineGraph from './LineGraph';

const socket: Socket = io('http://localhost:3001');

interface Callrecord {
    // Interface to save records of calls
    status: string;
    mancalldesc: string;
    mancallto: string;
}

interface Deptrecord {
    // Interface to save records of departments
    deptname: string;
    deptid: number;
}

interface Conrecord {
    // Interface to save records of consoles
    conname: string;
    conid: number;
}

interface ActiveCallRecord {
    consoleid: number;
    callhours: number;
    collmints: number;
    department: number;
    call1: string;
    call2: string;
    call3: string;
    oldcall: string;
}

interface GraphData {
    x: number;
    y: number;
}

function App() {
    // ------------------------------ Funcrions to switch windows ------------------------------

    // When set true, the div becomes visible
    const [showStartScreen, setShowStartScreen] = useState(true);
    const [showOrgID, setShowOrgID] = useState(false);
    const [showDashboard, setShowDashboard] = useState(true);
    const [showManCall, setShowManCall] = useState(false);
    const [showManCon, setShowManCon] = useState(false);
    const [showManDept, setShowManDept] = useState(false);

    const toggleStartScreen = () => {
        setShowStartScreen(false);
    };
    setTimeout(toggleStartScreen, 3000);

    const toggleOrgID = () => {
        setShowOrgID(!showOrgID);
    };

    const toggleDashboardVisibility = () => {
        setShowDashboard(true);
        setShowManCall(false);
        setShowManCon(false);
        setShowManDept(false);
    };

    const toggleManCallVisibility = () => {
        setShowDashboard(false);
        setShowManCall(true);
        setShowManCon(false);
        setShowManDept(false);
    };

    const toggleManConVisibility = () => {
        setShowDashboard(false);
        setShowManCall(false);
        setShowManCon(true);
        setShowManDept(false);
    };

    const toggleManDeptVisibility = () => {
        setShowDashboard(false);
        setShowManCall(false);
        setShowManCon(false);
        setShowManDept(true);
    };

    const [graphData, setGraphData] = useState<GraphData[]>([]);

    // Updating divs
    const [updateState, setUpdateState] = useState(true);

    const update = () => {
        setUpdateState(!updateState);
    }


    useEffect(() => {
        // fetching the data from database when the page refreshes
        Axios.get('http://localhost:3002/getGraph')
            .then((response) => {
                setGraphData(response.data); // Update conrecords state
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
            });
    }, []);

    const increasevalue = () => {
        // Increase graph today's value by one
        setGraphData((prevGraphData) => {
            const index = prevGraphData.findIndex((entry) => entry.x === 6);
            if (index !== -1) {
                const updatedGraphData = [...prevGraphData];
                updatedGraphData[index] = {
                    ...updatedGraphData[index],
                    y: updatedGraphData[index].y + 1,
                };
                return updatedGraphData;
            }
            return prevGraphData;
        });
    };

    /*const graphData = [
        { x: 0, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 1 },
        { x: 4, y: 2 },
        { x: 5, y: 5 },
        { x: 6, y: 1 },
    ];*/

    const [activeCallRecords, setActiveCallRecords] = useState<ActiveCallRecord[]>([]); // Array of callrecords

    useEffect(() => {
        // Getting active calls when the page refreshes
        Axios.get('http://localhost:3002/getActiveCalls')
            .then((response) => {
                const mappedActiveCalls = response.data.map(
                    (item: {
                        consoleidin: number;
                        callhoursin: number;
                        collmintsin: number;
                        departmentin: number;
                        call1in: string;
                        call2in: string;
                        call3in: string;
                        oldcallin: string;
                    }) => ({
                        consoleid: item.consoleidin,
                        callhours: item.callhoursin,
                        collmints: item.collmintsin,
                        department: item.departmentin,
                        call1: item.call1in,
                        call2: item.call2in,
                        call3: item.call3in,
                        oldcall: item.oldcallin,
                    })
                );
                setActiveCallRecords(mappedActiveCalls); // Update conrecords state
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error fetching calls:', error);
            });
    }, []);

    //----------------------------socketio connection----------------------
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('callUpdate', (receivedCallUpdates: ActiveCallRecord[]) => {
        console.log('Received call updates:', receivedCallUpdates);
    
        // Directly update the state with the received array
        setActiveCallRecords(receivedCallUpdates);
    });
    
    const [stat1, setStat1] = useState(''); // State for stat1
    const [stat2, setStat2] = useState(''); // State for stat2
    const [stat3, setStat3] = useState(''); // State for stat3

    socket.on('statUpdate', (data: { stat1: string, stat2: string, stat3: string }) => {
        console.log('Stat update received:', data);
        // React uses the prevStatn internally
        setStat1(prevStat1 => data.stat1);
        setStat2(prevStat2 => data.stat2);
        setStat3(prevStat3 => data.stat3);
    });

    socket.on('socketTest', (receivedvalue => {
        console.log('Socket received integer value : ', receivedvalue);
        console.log(receivedvalue);
    }));

    /*
    const testActiveCallRecords: ActiveCallRecord[] = [
        {
            consoleid: 215,
            callhours: 12,
            collmints: 15,
            department: 14,
            call1: '',
            call2: '',
            call3: 'White',
            oldcall:''
        },
        {
            consoleid: 256,
            callhours: 1,
            collmints: 15,
            department: 15,
            call1: '',
            call2: '',
            call3: '',
            oldcall: 'Yellow'
        },
        // Add more call records as needed
    ];*/

    const determineBackgroundColor = (call1: string, call2: string, call3: string) => {
        if (call1 === 'Red') return 'red';
        if (call1 === 'Yellow') return 'yellow';
        if (call1 === 'Green') return 'green';
        if (call1 === 'Blue') return 'blue';
        if (call1 === 'White') return 'white';
        if (call2 === 'Red') return 'red';
        if (call2 === 'Yellow') return 'yellow';
        if (call2 === 'Green') return 'green';
        if (call2 === 'Blue') return 'blue';
        if (call2 === 'White') return 'white';
        if (call3 === 'Red') return 'red';
        if (call3 === 'Yellow') return 'yellow';
        if (call3 === 'Green') return 'green';
        if (call3 === 'Blue') return 'blue';
        if (call3 === 'White') return 'white';
        return '#ffb70f'; // Default color if none of the conditions are met
    };

    // ------------------------------ Functions of 'Manage Calls' window ------------------------------

    const [callrecords, setCallrecords] = useState<Callrecord[]>([]); // Array of callrecords

    useEffect(() => {
        // fetching the data from database when the page refreshes
        Axios.get('http://localhost:3002/getCalls')
            .then((response) => {
                const mappedcalls = response.data.map(
                    (item: { Color: string; Description: string; CallTo: string }) => ({
                        status: item.Color,
                        mancalldesc: item.Description,
                        mancallto: item.CallTo,
                    })
                );
                setCallrecords(mappedcalls); // Update conrecords state
            })
            .catch((error) => {
                console.error('Error fetching calls:', error);
            });
    }, []);

    const createcall = (Color: String, Description: String, CallTo: String) => {
        // sending user input data to backend
        Axios.post('http://localhost:3002/createCall', {
            Color,
            Description,
            CallTo,
        }).then((response) => {});
    };

    const deletecall = (Color: String, Description: String, CallTo: String) => {
        // sending user input data to backend to delete
        Axios.post('http://localhost:3002/deletecall', {
            Color,
            Description,
            CallTo,
        }).then((response) => {});
    };

    // newCallrecord to when updating/adding a new callrecord
    const [newCallrecord, setNewCallrecord] = useState<Callrecord>({
        status: '',
        mancalldesc: '',
        mancallto: '',
    });

    const [showAddCallrecord, setShowAddCallrecord] = useState(false);

    // enters add mode
    const toggleAddCallrecord = () => {
        setNewCallrecord({ status: '', mancalldesc: '', mancallto: '' }); // Reset newCallrecord state
        setShowAddCallrecord(!showAddCallrecord);
    };

    // Gets input to newCallrecord
    const handleCallInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewCallrecord({ ...newCallrecord, [name]: value });
    };

    // saves the callrecord to callrecords
    const handleAddCallrecord = () => {
        createcall(newCallrecord.status, newCallrecord.mancalldesc, newCallrecord.mancallto);
        setCallrecords([...callrecords, newCallrecord]);
        setNewCallrecord({ status: '', mancalldesc: '', mancallto: '' });
        toggleAddCallrecord();
    };

    // cancels adding the callrecord
    const handleCancelAddCallrecord = () => {
        setNewCallrecord({ status: '', mancalldesc: '', mancallto: '' });
        toggleAddCallrecord();
    };

    // deletes a callrecord
    const handleDeleteCallrecord = (callIndex: number) => {
        const updatedCallrecords = [...callrecords];
        deletecall(
            callrecords[callIndex].status,
            callrecords[callIndex].mancalldesc,
            callrecords[callIndex].mancallto
        );
        updatedCallrecords.splice(callIndex, 1); // Remove the record at the specified callIndex
        setCallrecords(updatedCallrecords);
    };

    // Makes 'edit record' visible/invisible
    const [showEditCallrecord, setShowEditCallrecord] = useState(false);

    const toggleEditCallrecord = () => {
        setShowEditCallrecord(!showEditCallrecord);
    };

    const [editingCallrecord, setEditingCallrecord] = useState<Callrecord | null>(null);
    const [editingCallrecordIndex, setEditingCallrecordIndex] = useState<number>(-1);

    // Opens up details of an *existing* record in an edit callrecord div
    const handleEditCallrecord = (callIndex: number) => {
        setEditingCallrecord(callrecords[callIndex]);
        setEditingCallrecordIndex(callIndex); // Remember the callIndex of the record being edited
        toggleEditCallrecord();
    };

    // cancels editing the record, reverts the changes that were being done
    const handleEditCancelCallrecord = () => {
        setEditingCallrecord(null);
        setEditingCallrecordIndex(-1);
        toggleEditCallrecord(); // Hide the edit form
    };

    // saves the edited callrecord
    const handleEditAddCallrecord = () => {
        if (editingCallrecord && editingCallrecordIndex !== -1) {
            // Remove the old record
            const updatedCallrecords = callrecords.filter(
                (callrecord, callIndex) => callIndex !== editingCallrecordIndex
            );
            deletecall(
                editingCallrecord.status,
                editingCallrecord.mancalldesc,
                editingCallrecord.mancallto
            );

            // Add the new record with updated details
            const newEditedCallrecord: Callrecord = {
                status:
                    newCallrecord.status !== '' ? newCallrecord.status : editingCallrecord.status,
                mancalldesc:
                    newCallrecord.mancalldesc !== ''
                        ? newCallrecord.mancalldesc
                        : editingCallrecord.mancalldesc,
                mancallto:
                    newCallrecord.mancallto !== ''
                        ? newCallrecord.mancallto
                        : editingCallrecord.mancallto,
            };

            setCallrecords([...updatedCallrecords, newEditedCallrecord]);
            createcall(
                newEditedCallrecord.status,
                newEditedCallrecord.mancalldesc,
                newEditedCallrecord.mancallto
            );
            setEditingCallrecord(null); // Clear the editing state
            setEditingCallrecordIndex(-1); // Reset the editing callIndex
        }
        toggleEditCallrecord(); // Hide the edit form
    };

    // ------------------------------ Functions of 'Manage Consoles' window ------------------------------

    const [conrecords, setConrecords] = useState<Conrecord[]>([]); // Array of conrecords

    useEffect(() => {
        // fetching the data from database when the page refreshes
        Axios.get('http://localhost:3002/getMachines')
            .then((response) => {
                const mappedConrecords = response.data.map(
                    (item: { machine: string; consoleid: number }) => ({
                        conname: item.machine,
                        conid: item.consoleid,
                    })
                );
                setConrecords(mappedConrecords); // Update conrecords state
            })
            .catch((error) => {
                console.error('Error fetching machines:', error);
            });
    }, []);

    const createconrecord = (machine: String, consoleid: Number) => {
        // sending user input data to backend
        Axios.post('http://localhost:3002/createMachine', {
            machine,
            consoleid,
        }).then((response) => {});
    };

    const deleteconrecord = (machine: String, consoleid: Number) => {
        // sending user input data to backend to delete
        Axios.post('http://localhost:3002/deletemachine', {
            machine,
            consoleid,
        }).then((response) => {});
    };

    // newConrecord to when updating/adding a new conrecord
    const [newConrecord, setNewConrecord] = useState<Conrecord>({
        conname: '',
        conid: 0,
    });

    const [showAddConrecord, setShowAddConrecord] = useState(false);

    // enters add mode
    const toggleAddConrecord = () => {
        setNewConrecord({ conname: '', conid: 0 }); // Reset newConrecord state
        setShowAddConrecord(!showAddConrecord);
    };

    // Gets input to newConrecord
    const handleConInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewConrecord({ ...newConrecord, [name]: value });
    };

    // saves the conrecord to conrecords
    const handleAddConrecord = () => {
        createconrecord(newConrecord.conname, newConrecord.conid);
        setConrecords([...conrecords, newConrecord]);
        setNewConrecord({ conname: '', conid: 0 });
        toggleAddConrecord();
    };

    // cancels adding
    const handleCancelAddConrecord = () => {
        setNewConrecord({ conname: '', conid: 0 });
        toggleAddConrecord();
    };

    //Deletes record
    const handleDeleteConrecord = (conIndex: number) => {
        const updatedConrecords = [...conrecords];
        deleteconrecord(conrecords[conIndex].conname, conrecords[conIndex].conid);
        updatedConrecords.splice(conIndex, 1); // Remove the record at the specified conIndex
        setConrecords(updatedConrecords);
    };

    // edit record mode
    const [showEditConrecord, setShowEditConrecord] = useState(false);

    const toggleEditConrecord = () => {
        setShowEditConrecord(!showEditConrecord);
    };

    const [editingConrecord, setEditingConrecord] = useState<Conrecord | null>(null);
    const [editingConrecordIndex, setEditingConrecordIndex] = useState<number>(-1);

    // Opens record in an edit div
    const handleEditConrecord = (conIndex: number) => {
        setEditingConrecord(conrecords[conIndex]);
        setEditingConrecordIndex(conIndex); // Remember the conIndex of the record being edited
        toggleEditConrecord();
    };

    // cancels editing record, reverts any changes
    const handleEditCancelConrecord = () => {
        setEditingConrecord(null);
        setEditingConrecordIndex(-1);
        toggleEditConrecord(); // Hide the edit form
    };

    // saves the edited record
    const handleEditAddConrecord = () => {
        if (editingConrecord && editingConrecordIndex !== -1) {
            // Remove the old record
            const updatedConrecords = conrecords.filter(
                (conrecord, conIndex) => conIndex !== editingConrecordIndex
            );
            deleteconrecord(editingConrecord.conname, editingConrecord.conid); //delete from database
            // Add the new record with updated details
            const newEditedConrecord: Conrecord = {
                conname:
                    newConrecord.conname !== '' ? newConrecord.conname : editingConrecord.conname,
                conid: newConrecord.conid !== 0 ? newConrecord.conid : editingConrecord.conid,
            };

            setConrecords([...updatedConrecords, newEditedConrecord]);
            createconrecord(newEditedConrecord.conname, newEditedConrecord.conid); //add to database
            setEditingConrecord(null); // Clear the editing state
            setEditingConrecordIndex(-1); // Reset the editing deptIndex
        }
        toggleEditConrecord(); // Hide the edit form
    };

    // ------------------------------ Functions of 'Manage Departments' window ------------------------------

    const [deptrecords, setDeptrecords] = useState<Deptrecord[]>([]); // Array of deptrecords

    useEffect(() => {
        // fetching the data from database when the page refreshes
        Axios.get('http://localhost:3002/getUsers')
            .then((response) => {
                const mappedUsers = response.data.map(
                    (item: { name: string; deptnumber: number }) => ({
                        deptname: item.name,
                        deptid: item.deptnumber,
                    })
                );
                setDeptrecords(mappedUsers); // Update conrecords state
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
            });
    }, []);

    const createuserrecord = (name: String, deptnumber: Number) => {
        // sending user input data to backend
        Axios.post('http://localhost:3002/createUser', {
            name,
            deptnumber,
        }).then((response) => {});
    };

    const deleteuserrecord = (name: String, deptnumber: Number) => {
        // sending user input data to backend to delete
        Axios.post('http://localhost:3002/deleteuser', {
            name,
            deptnumber,
        }).then((response) => {});
    };

    // new record to when adding/editing records
    const [newDeptrecord, setNewDeptrecord] = useState<Deptrecord>({
        deptname: '',
        deptid: 0,
    });

    const [showAddDeptrecord, setShowAddDeptrecord] = useState(false);

    // enters add mode
    const toggleAddDeptrecord = () => {
        setNewDeptrecord({ deptname: '', deptid: 0 }); // Reset newCallrecord state
        setShowAddDeptrecord(!showAddDeptrecord);
    };

    // gets input into new record
    const handleDeptInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewDeptrecord({ ...newDeptrecord, [name]: value });
    };

    // saves the deptrecord to deptrecords
    const handleAddDeptrecord = () => {
        setDeptrecords([...deptrecords, newDeptrecord]);
        createuserrecord(newDeptrecord.deptname, newDeptrecord.deptid);
        setNewDeptrecord({ deptname: '', deptid: 0 });
        toggleAddDeptrecord();
    };

    // cancels adding
    const handleCancelAddDeptrecord = () => {
        setNewDeptrecord({ deptname: '', deptid: 0 });
        toggleAddDeptrecord();
    };

    // deletes record
    const handleDeleteDeptrecord = (deptIndex: number) => {
        const updatedDeptrecords = [...deptrecords];
        deleteuserrecord(deptrecords[deptIndex].deptname, deptrecords[deptIndex].deptid);
        updatedDeptrecords.splice(deptIndex, 1); // Remove the record at the specified deptIndex
        setDeptrecords(updatedDeptrecords);
    };

    // edit mode
    const [showEditDeptrecord, setShowEditDeptrecord] = useState(false);

    const toggleEditDeptrecord = () => {
        setShowEditDeptrecord(!showEditDeptrecord);
    };

    const [editingDeptrecord, setEditingDeptrecord] = useState<Deptrecord | null>(null);
    const [editingDeptrecordIndex, setEditingDeptrecordIndex] = useState<number>(-1);

    // opens revord in edit div
    const handleEditDeptrecord = (deptIndex: number) => {
        setEditingDeptrecord(deptrecords[deptIndex]);
        setEditingDeptrecordIndex(deptIndex); // Remember the deptIndex of the record being edited
        toggleEditDeptrecord();
    };

    // cancels editing, reverting changes
    const handleEditCancelDeptrecord = () => {
        setEditingDeptrecord(null);
        setEditingDeptrecordIndex(-1);
        toggleEditDeptrecord(); // Hide the edit form
    };

    // saves the edited record
    const handleEditAddDeptrecord = () => {
        if (editingDeptrecord && editingDeptrecordIndex !== -1) {
            // Remove the old record
            const updatedDeptrecords = deptrecords.filter(
                (deptrecord, deptIndex) => deptIndex !== editingDeptrecordIndex
            );
            deleteuserrecord(editingDeptrecord.deptname, editingDeptrecord.deptid);
            // Add the new record with updated details
            const newEditedDeptrecord: Deptrecord = {
                deptname:
                    newDeptrecord.deptname !== ''
                        ? newDeptrecord.deptname
                        : editingDeptrecord.deptname,
                deptid:
                    newDeptrecord.deptid !== 0 ? newDeptrecord.deptid : editingDeptrecord.deptid,
            };

            setDeptrecords([...updatedDeptrecords, newEditedDeptrecord]);
            createuserrecord(newEditedDeptrecord.deptname, newEditedDeptrecord.deptid);
            setEditingDeptrecord(null); // Clear the editing state
            setEditingDeptrecordIndex(-1); // Reset the editing deptIndex
        }
        toggleEditDeptrecord(); // Hide the edit form
    };

    // ------------------------------ the app ------------------------------

    return (
        // Top bar
        <div className={styles.App}>
            <div className={styles.topbar}>
                <h1 className={styles.logotext}>ANDON</h1>
                <button 
                    className={styles.account}
                    onClick={toggleOrgID}></button>
            </div>

            <div className={styles.navbar}>
                <button // Navigation bar
                    className={Classnames(styles.dashbutt, {
                        [styles.navbutclicked]: showDashboard,
                    })}
                    onClick={toggleDashboardVisibility}
                >
                    <img src="/src/assets/dash.svg" alt="" className={styles.dashim} />
                </button>

                <button
                    className={Classnames(styles.conbutt, {
                        [styles.navbutclicked]: showManCon,
                    })}
                    onClick={toggleManConVisibility}
                >
                    <img src="/src/assets/machine.svg" alt="" className={styles.dashim} />
                </button>

                <button
                    className={Classnames(styles.callbutt, {
                        [styles.navbutclicked]: showManCall,
                    })}
                    onClick={toggleManCallVisibility}
                >
                    <img src="/src/assets/call.svg" alt="" className={styles.dashim} />
                </button>

                <button
                    className={Classnames(styles.deptbutt, {
                        [styles.navbutclicked]: showManDept,
                    })}
                    onClick={toggleManDeptVisibility}
                >
                    <img src="/src/assets/dept.svg" alt="" className={styles.dashim} />
                </button>
            </div>
            {showDashboard && ( // Dasboard
                <div className={styles.dashboard}>
                    <h1 className={styles.boardname}>Dashboard</h1>
                    <div className={styles.graph}>
                        <h3 className={styles.cardtitle}>Daily Andon Calls </h3>
                        <div className={styles.graphcontain}>
                            <LineGraph data={graphData} />
                        </div>
                    </div>
                    <div className={styles.stats}>
                        <h3 className={styles.cardtitle}>Stats</h3>
                        <div className={styles.statgrid}>
                            <div className={styles.statcard}>
                                <h1 className={styles.stat1label}>Total Downtime for the day</h1>
                                <h1 className={styles.stat1}>{stat1}</h1>
                            </div>
                            <div className={styles.statcard}>
                                <h1 className={styles.stat1label}>Current down machines</h1>
                                <h1 className={styles.stat1}>{stat2}</h1>
                            </div>
                            <div className={styles.statcard}>
                                <h1 className={styles.stat1label}>Probability of a breakdown</h1>
                                <h1 className={styles.stat1}>{stat3}</h1>
                            </div>
                        </div>
                    </div>
                    <div className={styles.currentcalls}>
                        <h3 className={styles.cardtitle}>Current Andon Calls</h3>
                        <div className={styles.calls}>
                            {activeCallRecords.map(
                                (
                                    activeCallRecord,
                                    activeCallIndex // Display calls
                                ) => (
                                    <div key={activeCallIndex}>
                                        {(activeCallRecord.call1 != '' ||
                                            activeCallRecord.call2 != '' ||
                                            activeCallRecord.call3 != '') && ( // If not attended
                                            <div className={styles.callsat}>
                                                <div className={styles.callsatleft}>
                                                    <h1 className={styles.machinenum}>
                                                        {conrecords.find(
                                                            (record) =>
                                                                record.conid ==
                                                                activeCallRecord.consoleid
                                                        )?.conname || 'Undefined'}
                                                    </h1>
                                                    <h3 className={styles.department}>
                                                        {deptrecords.find(
                                                            (record) =>
                                                                record.deptid ==
                                                                activeCallRecord.department
                                                        )?.deptname || 'Undefined'}
                                                    </h3>
                                                    <h2 className={styles.calltotext}>
                                                        Andon Call to
                                                    </h2>
                                                    <h3 className={styles.callto}>
                                                        {activeCallRecord.call1 &&
                                                            (callrecords.find(
                                                                (record) =>
                                                                    record.status ===
                                                                    activeCallRecord.call1
                                                            )?.mancallto ||
                                                                'Undefined')}
                                                        {activeCallRecord.call2 &&
                                                            (callrecords.find(
                                                                (record) =>
                                                                    record.status ===
                                                                    activeCallRecord.call2
                                                            )?.mancallto ||
                                                                'Undefined')}
                                                        {activeCallRecord.call3 &&
                                                            (callrecords.find(
                                                                (record) =>
                                                                    record.status ===
                                                                    activeCallRecord.call3
                                                            )?.mancallto ||
                                                                'Undefined')}
                                                    </h3>
                                                </div>
                                                <div className={styles.callsatright}>
                                                    <div className={styles.timeblock}>
                                                        <h1 className={styles.time}>
                                                            {activeCallRecord.callhours}:
                                                            {activeCallRecord.collmints}
                                                        </h1>
                                                        <div
                                                            className={styles.status}
                                                            style={{
                                                                backgroundColor:
                                                                    determineBackgroundColor(
                                                                        activeCallRecord.call1,
                                                                        activeCallRecord.call2,
                                                                        activeCallRecord.call3
                                                                    ),
                                                            }}
                                                        />
                                                    </div>
                                                    <h1 className={styles.attended}>
                                                        Not Attended Yet
                                                    </h1>
                                                </div>
                                            </div>
                                        )}
                                        {activeCallRecord.call1 == '' &&
                                            activeCallRecord.call2 == '' &&
                                            activeCallRecord.call3 == '' && (
                                                <div className={styles.att}>
                                                    <div className={styles.callsatleft}>
                                                        <h1 className={styles.machinenum}>
                                                            {conrecords.find(
                                                                (record) =>
                                                                    record.conid ==
                                                                    activeCallRecord.consoleid
                                                            )?.conname || 'Undefined'}
                                                        </h1>
                                                        <h3 className={styles.department}>
                                                            {deptrecords.find(
                                                                (record) =>
                                                                    record.deptid ==
                                                                    activeCallRecord.department
                                                            )?.deptname || 'Undefined'}
                                                        </h3>
                                                    </div>
                                                    <div className={styles.callsatright}>
                                                        <div className={styles.timeblock}>
                                                            <h1 className={styles.time}>
                                                                {activeCallRecord.callhours}:
                                                                {activeCallRecord.collmints}
                                                            </h1>
                                                            <div
                                                                className={styles.status}
                                                                style={{
                                                                    backgroundColor:
                                                                        determineBackgroundColor(
                                                                            activeCallRecord.oldcall,
                                                                            activeCallRecord.call2,
                                                                            activeCallRecord.call3
                                                                        ),
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showManCon && ( // Manage consoles
                <div className={styles.manageconsoles}>
                    <h1 className={styles.boardname}>Manage Consoles</h1>
                    <div className={styles.coltitle}>
                        <h1 className={styles.coltitletext}>Machine</h1>
                        <div></div>
                        <h1 className={styles.coltitletext}>Console ID</h1>
                    </div>

                    {conrecords.map(
                        (
                            conrecord,
                            conIndex // displays consoles
                        ) => (
                            <div key={conIndex}>
                                {conIndex !== editingConrecordIndex && (
                                    <div className={Classnames(styles.managecallcard, styles.con)}>
                                        <div className={styles.coltitle}>
                                            <h1
                                                className={Classnames(
                                                    styles.cardtext,
                                                    styles.machineno
                                                )}
                                            >
                                                {conrecord.conname}
                                            </h1>
                                            <h1
                                                className={Classnames(
                                                    styles.cardtext,
                                                    styles.conid
                                                )}
                                            >
                                                {conrecord.conid}
                                            </h1>
                                            <div className={styles.concalls}></div>
                                            <div className={styles.mancallbut}>
                                                <button
                                                    className={styles.mancalldel}
                                                    onClick={() => handleEditConrecord(conIndex)}
                                                >
                                                    <img
                                                        src="/src/assets/edit.svg"
                                                        alt=""
                                                        className={styles.editsvg}
                                                    />
                                                </button>
                                                <button
                                                    className={styles.mancalledit}
                                                    onClick={() => handleDeleteConrecord(conIndex)}
                                                >
                                                    <img
                                                        src="/src/assets/del.svg"
                                                        alt=""
                                                        className={styles.editsvg}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {showAddConrecord && ( // Add div
                        <div
                            className={Classnames(styles.managecallcard, styles.con, styles.edit2)}
                        >
                            <h1 className={styles.cardedittitle}>Edit </h1>
                            <div className={styles.coltitle}>
                                <input
                                    type="text"
                                    name="conname"
                                    value={newConrecord.conname}
                                    onChange={handleConInputChange}
                                    placeholder="Console name"
                                    className={styles.machinein}
                                />

                                <input
                                    type="number"
                                    name="conid"
                                    value={newConrecord.conid}
                                    onChange={handleConInputChange}
                                    placeholder="ID"
                                    className={styles.deptin}
                                />

                                <div className={styles.mancallbut}>
                                    <button
                                        className={styles.mancalldel}
                                        onClick={handleAddConrecord}
                                    >
                                        <img
                                            src="/src/assets/check.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                    <button
                                        className={styles.mancalledit}
                                        onClick={handleCancelAddConrecord}
                                    >
                                        <img
                                            src="/src/assets/close.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {editingConrecord && ( // edit div
                        <div
                            className={Classnames(styles.managecallcard, styles.con, styles.edit2)}
                        >
                            <h1 className={styles.cardedittitle}>Edit </h1>
                            <div className={styles.coltitle}>
                                <input
                                    type="text"
                                    name="conname"
                                    value={newConrecord.conname}
                                    onChange={handleConInputChange}
                                    placeholder={
                                        editingConrecord ? editingConrecord.conname : 'Console name'
                                    }
                                    className={styles.machinein}
                                />

                                <input
                                    type="number"
                                    name="conid"
                                    value={newConrecord.conid}
                                    onChange={handleConInputChange}
                                    placeholder={
                                        editingConrecord ? editingConrecord.conid.toString() : '0'
                                    }
                                    className={styles.deptin}
                                />

                                <div className={styles.mancallbut}>
                                    <button
                                        className={styles.mancalldel}
                                        onClick={handleEditAddConrecord}
                                    >
                                        <img
                                            src="/src/assets/check.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                    <button
                                        className={styles.mancalledit}
                                        onClick={handleEditCancelConrecord}
                                    >
                                        <img
                                            src="/src/assets/close.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showAddConrecord &&
                        !editingConrecord && ( // Add button
                            <button className={styles.addbutton} onClick={toggleAddConrecord}>
                                Add Consoles +
                            </button>
                        )}
                </div>
            )}
            {showManCall && ( // Manage Calls
                <div className={styles.managecalls}>
                    <h1 className={styles.boardname}>Manage Calls</h1>

                    <div className={styles.coltitle}>
                        <h1 className={styles.coltitletext}>Color</h1>
                        <h1 className={styles.coltitletext}>Description </h1>
                        <div></div>
                        <h1 className={styles.coltitletext}>Call To</h1>
                    </div>

                    {callrecords.map(
                        (
                            callrecord,
                            callIndex // Display calls
                        ) => (
                            <div key={callIndex}>
                                {callIndex !== editingCallrecordIndex && (
                                    <div className={styles.managecallcard}>
                                        <div className={styles.coltitle}>
                                            <h1
                                                className={Classnames(
                                                    styles.cardtext,
                                                    styles.stattmp
                                                )}
                                            >
                                                {callrecord.status}
                                            </h1>
                                            <h1
                                                className={Classnames(
                                                    styles.cardtext,
                                                    styles.mancalldesc
                                                )}
                                            >
                                                {callrecord.mancalldesc}
                                            </h1>
                                            <h1
                                                className={Classnames(
                                                    styles.cardtext,
                                                    styles.mancallto
                                                )}
                                            >
                                                {callrecord.mancallto}
                                            </h1>
                                            <div className={styles.mancallbut}>
                                                <button
                                                    className={styles.mancalldel}
                                                    onClick={() => handleEditCallrecord(callIndex)}
                                                >
                                                    <img
                                                        src="/src/assets/edit.svg"
                                                        alt=""
                                                        className={styles.editsvg}
                                                    />
                                                </button>
                                                <button
                                                    className={styles.mancalledit}
                                                    onClick={() =>
                                                        handleDeleteCallrecord(callIndex)
                                                    }
                                                >
                                                    <img
                                                        src="/src/assets/del.svg"
                                                        alt=""
                                                        className={styles.editsvg}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {showAddCallrecord && ( // Add call div
                        <div className={Classnames(styles.managecallcard, styles.cardedit)}>
                            <h1 className={styles.cardedittitle}>Add Call</h1>
                            <div className={styles.coltitle}>
                                <select
                                    name="status"
                                    className={styles.colorlist}
                                    value={newCallrecord.status}
                                    onChange={handleCallInputChange}
                                >
                                    <option value="" disabled selected>
                                        Color
                                    </option>
                                    <option value="Red">Red </option>
                                    <option value="Yellow">Yellow</option>
                                    <option value="Green">Green</option>
                                    <option value="Blue">Blue</option>
                                    <option value="White">White</option>
                                </select>
                                <input
                                    type="text"
                                    name="mancalldesc"
                                    value={newCallrecord.mancalldesc}
                                    onChange={handleCallInputChange}
                                    placeholder="Description"
                                    className={styles.mancalldescin}
                                />
                                <input
                                    type="text"
                                    name="mancallto"
                                    value={newCallrecord.mancallto}
                                    onChange={handleCallInputChange}
                                    placeholder="Call to"
                                    className={styles.mancalltoin}
                                />

                                <div className={styles.mancallbut}>
                                    <button
                                        className={styles.mancalldel}
                                        onClick={handleAddCallrecord}
                                    >
                                        <img
                                            src="/src/assets/check.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                    <button
                                        className={styles.mancalledit}
                                        onClick={handleCancelAddCallrecord}
                                    >
                                        <img
                                            src="/src/assets/close.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {editingCallrecord && ( // Edit Call div
                        <div className={Classnames(styles.managecallcard, styles.cardedit)}>
                            <h1 className={styles.cardedittitle}>Edit Call</h1>
                            <div className={styles.coltitle}>
                                <select
                                    name="status"
                                    className={styles.colorlist}
                                    value={newCallrecord.status}
                                    onChange={handleCallInputChange}
                                >
                                    <option value="" disabled selected>
                                        {editingCallrecord ? editingCallrecord.status : ''}
                                    </option>
                                    <option value="Red">Red </option>
                                    <option value="Yellow">Yellow</option>
                                    <option value="Green">Green</option>
                                    <option value="Blue">Blue</option>
                                    <option value="White">White</option>
                                </select>
                                <input
                                    type="text"
                                    name="mancalldesc"
                                    value={newCallrecord.mancalldesc}
                                    onChange={handleCallInputChange}
                                    placeholder={
                                        editingCallrecord
                                            ? editingCallrecord.mancalldesc
                                            : 'Description'
                                    }
                                    className={styles.mancalldescin}
                                />
                                <input
                                    type="text"
                                    name="mancallto"
                                    value={newCallrecord.mancallto}
                                    onChange={handleCallInputChange}
                                    placeholder={
                                        editingCallrecord ? editingCallrecord.mancallto : 'Call to'
                                    }
                                    className={styles.mancalltoin}
                                />

                                <div className={styles.mancallbut}>
                                    <button
                                        className={styles.mancalldel}
                                        onClick={handleEditAddCallrecord}
                                    >
                                        <img
                                            src="/src/assets/check.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                    <button
                                        className={styles.mancalledit}
                                        onClick={handleEditCancelCallrecord}
                                    >
                                        <img
                                            src="/src/assets/close.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showAddCallrecord &&
                        !editingCallrecord && ( // Add button
                            <button className={styles.addbutton} onClick={toggleAddCallrecord}>
                                Add Calls +
                            </button>
                        )}
                </div>
            )}
            {showManDept && ( // Manage departments
                <div className={styles.managedepts}>
                    <h1 className={styles.boardname}>Manage Users</h1>
                    <div className={styles.coltitle}>
                        <h1 className={styles.coltitletext}>Name</h1>
                        <h1 className={Classnames(styles.coltitletext, styles.deptnumtit)}>
                            Dept. Number{' '}
                        </h1>
                    </div>

                    {deptrecords.map(
                        (
                            deptrecord,
                            deptIndex // displays departments
                        ) => (
                            <div key={deptIndex}>
                                {deptIndex !== editingDeptrecordIndex && (
                                    <div className={Classnames(styles.managecallcard, styles.dep1)}>
                                        <div className={styles.coltitle}>
                                            <h1
                                                className={Classnames(
                                                    styles.cardtext,
                                                    styles.deptname
                                                )}
                                            >
                                                {deptrecord.deptname}
                                            </h1>
                                            <h1
                                                className={Classnames(
                                                    styles.cardtext,
                                                    styles.deptnum
                                                )}
                                            >
                                                {deptrecord.deptid}
                                            </h1>
                                            <div className={styles.mancallbut}>
                                                <button
                                                    className={styles.mancalldel}
                                                    onClick={() => handleEditDeptrecord(deptIndex)}
                                                >
                                                    <img
                                                        src="/src/assets/edit.svg"
                                                        alt=""
                                                        className={styles.editsvg}
                                                    />
                                                </button>
                                                <button
                                                    className={styles.mancalledit}
                                                    onClick={() =>
                                                        handleDeleteDeptrecord(deptIndex)
                                                    }
                                                >
                                                    <img
                                                        src="/src/assets/del.svg"
                                                        alt=""
                                                        className={styles.editsvg}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {showAddDeptrecord && ( // Add div
                        <div
                            className={Classnames(
                                styles.managecallcard,
                                styles.cardedit,
                                styles.dep2
                            )}
                        >
                            <h1 className={styles.cardedittitle}>Edit </h1>
                            <div className={styles.coltitle}>
                                <input
                                    type="text"
                                    name="deptname"
                                    value={newDeptrecord.deptname}
                                    onChange={handleDeptInputChange}
                                    placeholder="Department name"
                                    className={styles.deptnamein}
                                />

                                <input
                                    type="number"
                                    name="deptid"
                                    value={newDeptrecord.deptid}
                                    onChange={handleDeptInputChange}
                                    placeholder="ID"
                                    className={styles.deptnumin}
                                />

                                <div className={styles.mancallbut}>
                                    <button
                                        className={styles.mancalldel}
                                        onClick={handleAddDeptrecord}
                                    >
                                        <img
                                            src="/src/assets/check.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                    <button
                                        className={styles.mancalledit}
                                        onClick={handleCancelAddDeptrecord}
                                    >
                                        <img
                                            src="/src/assets/close.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {editingDeptrecord && ( // edit div
                        <div
                            className={Classnames(
                                styles.managecallcard,
                                styles.cardedit,
                                styles.dep2
                            )}
                        >
                            <h1 className={styles.cardedittitle}>Edit </h1>
                            <div className={styles.coltitle}>
                                <input
                                    type="text"
                                    name="deptname"
                                    value={newDeptrecord.deptname}
                                    onChange={handleDeptInputChange}
                                    placeholder={
                                        editingDeptrecord
                                            ? editingDeptrecord.deptname
                                            : 'Department Name'
                                    }
                                    className={styles.deptnamein}
                                />

                                <input
                                    type="number"
                                    name="deptid"
                                    value={newDeptrecord.deptid}
                                    onChange={handleDeptInputChange}
                                    placeholder={
                                        editingDeptrecord
                                            ? editingDeptrecord.deptid.toString()
                                            : '0'
                                    }
                                    className={styles.deptnumin}
                                />

                                <div className={styles.mancallbut}>
                                    <button
                                        className={styles.mancalldel}
                                        onClick={handleEditAddDeptrecord}
                                    >
                                        <img
                                            src="/src/assets/check.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                    <button
                                        className={styles.mancalledit}
                                        onClick={handleEditCancelDeptrecord}
                                    >
                                        <img
                                            src="/src/assets/close.svg"
                                            alt=""
                                            className={styles.editsvg}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showAddDeptrecord &&
                        !editingDeptrecord && ( // Add button
                            <button className={styles.addbutton} onClick={toggleAddDeptrecord}>
                                Add Departments +
                            </button>
                        )}
                </div>
            )}
            {showStartScreen && (
                <div className={styles.startscreen}>
                    <h1 className={styles.startscreentext}>ANDON</h1>
                </div>
            )}
            {showOrgID && (
                <div className={styles.orgnamecard}>
                <h1 className={styles.orgnametitle}>Organisation ID:</h1>
                <h1 className={styles.orgname}>0001</h1>
            </div>)}
        </div>
    );
}

export default App;
