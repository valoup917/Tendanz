"use client"
import { parseDate } from "@internationalized/date";
import React, { useCallback, useEffect, useState } from 'react';
import { Select, SelectItem } from "@nextui-org/select";
import { getAllUsersRequest } from '@/services/usersRequests';
import { deleteContractRequest, getContractsFromUsersRequest, postContractForUserRequest, updateContractForUserRequest } from '@/services/contractsRequests';
import type { Selection } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { checkboxGroup, DateInput } from '@nextui-org/react';
import { now } from "@internationalized/date";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Tooltip } from "@nextui-org/react";

export default function Dashboard() {

    const [addContractModal, setAddContractModal] = useState<Boolean>(false);
    const [editContractModal, setEditContractModal] = useState<null | number>(null);

    const [selecteUserFilter, setSelecteUserFilter] = useState<Selection>(new Set([]));
    const [users, setUsers] = useState<any[]>([]);
    const [startDate, setStartDate] = useState<any>(now("Europe/Brussels"));
    const [endDate, setEndDate] = useState<any>(now("Europe/Brussels"));
    const [contracts, setContracts] = useState<any[] | null>(null);
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set(["Home"]));

    const selectedValue = React.useMemo(
        () => Array.from(selectedKeys).join(", ").replace(/_/g, ""),
        [selectedKeys],
    );

    async function fetchContracts(userId : number) {
        try {
            const contracts = await getContractsFromUsersRequest(userId);
            const formattedContracts = contracts.map((contract: any) => ({
                ...contract,
                start_date: new Date(contract.start_date).toLocaleDateString(), // Convert date to string
                end_date: new Date(contract.end_date).toLocaleDateString(),   // Convert date to string
            }));
            setContracts(formattedContracts);
        } catch (e: any) {
            console.log(e);
        }
    }

    async function onUserSelectionForFilterChange(user: Selection) {
        const userSelected = user as any;
        setSelecteUserFilter(user);
        await fetchContracts(userSelected.currentKey);
    }

    useEffect(() => {
        async function getUsers() {
            try {
                const allUsers = await getAllUsersRequest();
                setUsers(allUsers);
            } catch (e: any) {
                console.log(e);
            }
        }
        getUsers();
    }, []);

    async function updateContract() {
        try {
            const startDateData = `${startDate.year}-${startDate.month}-${startDate.day}`
            const endDateData = `${endDate.year}-${endDate.month}-${endDate.day}`
            await updateContractForUserRequest({
                insurance_type: selectedValue,
                start_date: startDateData,
                end_date: endDateData
            }, editContractModal as number);
            setEditContractModal(null);
            await fetchContracts(selecteUserFilter.currentKey);
        } catch (e: any) {
            console.log(e)
        }
    }

    async function createContract() {
        try {
            const startDateData = `${startDate.year}-${startDate.month}-${startDate.day}`
            const endDateData = `${endDate.year}-${endDate.month}-${endDate.day}`
            await postContractForUserRequest({
                insurance_type: selectedValue,
                start_date: startDateData,
                end_date: endDateData
            });
            setAddContractModal(false);
            await fetchContracts(selecteUserFilter.currentKey);
        } catch (e: any) {
            console.log(e)
        }
    }

    async function deleteContract(contractId: number, ownerId: number) {
        try {
            await deleteContractRequest(contractId);
        } catch (e: any) {
            console.log(e)
        }
        try {
            await fetchContracts(ownerId);
        } catch (e: any) {
            console.log(e)
        }
    }

    const handleEditClick = (item : any) => {
        setEditContractModal(item.id);

        setStartDate(parseDate(new Date(item.start_date).toISOString().split('T')[0]));
        setEndDate(parseDate(new Date(item.end_date).toISOString().split('T')[0]));

        setSelectedKeys(item.insurance_type);
    };

    const createcContractInputs = [
        <Dropdown>
            <DropdownTrigger>
                <Button className="capitalize" variant="bordered">
                {selectedValue}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={selectedKeys}
                selectionMode="single"
                variant="flat"
                onSelectionChange={setSelectedKeys}
            >
                <DropdownItem key="HEALTH">Health</DropdownItem>
                <DropdownItem key="AUTO">Auto</DropdownItem>
                <DropdownItem key="HOME">Home</DropdownItem>
            </DropdownMenu>
        </Dropdown>,
        <DateInput granularity="day" key="start_date" label="Start Date" variant="bordered" value={startDate} onChange={setStartDate} />,
        <DateInput granularity="day" key="end_date" label="End Date" variant="bordered" value={endDate} onChange={setEndDate} />,
    ] as React.JSX.Element[]

    const editContractInputs = [
        <Dropdown>
            <DropdownTrigger>
                <Button className="capitalize" variant="bordered">
                    {selectedValue}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={selectedKeys}
                selectionMode="single"
                variant="flat"
                onSelectionChange={setSelectedKeys}
            >
                <DropdownItem key="HEALTH">Health</DropdownItem>
                <DropdownItem key="AUTO">Auto</DropdownItem>
                <DropdownItem key="HOME">Home</DropdownItem>
            </DropdownMenu>
        </Dropdown>,
        <DateInput granularity="day" key="start_date" label="Start Date" variant="bordered" value={startDate} onChange={setStartDate} />,
        <DateInput granularity="day" key="end_date" label="End Date" variant="bordered" value={endDate} onChange={setEndDate} />,
    ] as React.JSX.Element[]

    const columns = [
        { key: "id", label: "Contract Id" },
        { key: "annual_premium", label: "Annual premium" },
        { key: "start_date", label: "Start" },
        { key: "end_date", label: "End" },
        { key: "insurance_type", label: "Type" },
        { key: "owner_id", label: "Owner Id" },
        { key: "actions", label: "Actions" }
    ];

    const renderCell = useCallback((item: any, columnKey: any) => {
        switch (columnKey) {
            case "actions":
                return (
                    <div className="relative flex items-center gap-4">
                        <Tooltip content="Edit">
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => { handleEditClick(item) }}>
                                <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em">
                                    <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
                                    <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
                                    <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
                                </svg>
                            </span>
                        </Tooltip>
                        <Tooltip content="Delete">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => deleteContract(item.id, item.owner_id)}>
                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" className="text-danger" viewBox="0 0 20 20" width="1em">
                                        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                                        <path d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                                        <path d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                                        <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                                        <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                                    </svg>
                                </span>
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return getKeyValue(item, columnKey);
        }
    }, []);

    return (
        <div className='h-screen w-screen text-white bg-background'>
            <div className='justify-center items-center flex flex-col'>
                <h1 className="text-4xl font-bold my-10">
                    Contracts
                </h1>
                
                <Select
                    variant="bordered"
                    label="Select a client"
                    selectedKeys={selecteUserFilter}
                    className="max-w-xs"
                    description="Filter contracts by client"
                    errorMessage="You must select a client to view contracts"
                    onSelectionChange={onUserSelectionForFilterChange}
                    >
                    {users.map((user) => (
                        <SelectItem key={user.id}>
                            {user.email}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            <div className='mt-20 flex flex-col space-y-10 w-full'>
                {
                    addContractModal &&
                    <Modal
                        isOpen={true}
                        placement="top-center"
                    >
                        <ModalContent>
                            {() => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        Add a new contract
                                    </ModalHeader>
                                    <ModalBody>
                                        {createcContractInputs.map((input) => (
                                            <div key={input.key} className='justify-center flex'>
                                                {input}
                                            </div>
                                        ))}
                                    </ModalBody>
                                    <ModalFooter>
                                        <div className='flex w-full justify-between mt-2'>
                                            <button onClick={() => { setAddContractModal(false); }} className='bg-gray-200/80  rounded-lg p-2'>
                                                Back
                                            </button>
                                            <button onClick={async () => ( await createContract())} className='bg-green-400 rounded-lg p-2'>
                                                Add Contract
                                            </button>
                                        </div>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                }
                {
                    editContractModal &&
                    <Modal
                        isOpen={true}
                        placement="top-center"
                    >
                        <ModalContent>
                            {() => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        Edit contract
                                    </ModalHeader>
                                    <ModalBody>
                                        {editContractInputs.map((input) => (
                                            <div key={input.key} className='justify-center flex'>
                                                {input}
                                            </div>
                                        ))}
                                    </ModalBody>
                                    <ModalFooter>
                                        <div className='flex w-full justify-between mt-2'>
                                            <button onClick={() => { setEditContractModal(null); }} className='bg-gray-500/80  rounded-lg p-2'>
                                                Back
                                            </button>
                                            <button onClick={async () => (await updateContract())} className='bg-green-700 rounded-lg p-2'>
                                                Edit Contract
                                            </button>
                                        </div>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                }

                <div className='w-full h-full flex flex-col space-y-8'>
                    <div className='w-full h-full flex justify-center items-center'>
                        <button className='bg-green-500/50 h-12 w-64 rounded-xl' onClick={() => setAddContractModal(true)}>
                            Add a contract
                        </button>
                    </div>
                </div>
                {
                    contracts && contracts.length == 0 &&
                    <div className="text-center text-xl text-red-500 font-semibold">
                        No contracts found
                    </div>
                }
                {
                    contracts && contracts.length > 0 &&

                    <div className="flex items-center justify-center">
                        <Table aria-label="Table displaying data" className='w-10/12 mx-4'>
                            <TableHeader columns={columns}>
                                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                            </TableHeader>
                            <TableBody items={contracts} emptyContent={"No rows to display."}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                }
                {
                    contracts == null &&
                    <div className="text-xl w-full text-red-500 font-semibold text-center justify-center items-center">
                        You must select a user
                    </div>
                }
            </div>
        </div>
    )
}

function getContractsFromUsers(currentKey: any) {
    throw new Error('Function not implemented.');
}
