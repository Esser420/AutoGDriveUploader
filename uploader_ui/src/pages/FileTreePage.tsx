import React, { useEffect } from "react";
import FileTree from "../components/FileTree/FileTree";
import "./FileTreePage.css";
import NavBar from "../components/NavBar/NavBar";
import { useRecoilState, useSetRecoilState } from "recoil";
import { selectedSyncFolderState, openFileState, selectedFolderIdState, availableSyncFoldersState, loadingFolderIdState, downloadFileIdState, downloadFolderIdState, openFolderState, addSyncFolderState, removeSyncFolderState } from "../states/filetree";

const commandSocket = new WebSocket("ws://localhost:6900/command");

const FileTreePage = () => {
    const [selectedSyncFolder] = useRecoilState(selectedSyncFolderState);
    const [openFileId, setOpenFileId] = useRecoilState(openFileState);
    const [openFolderId, setOpenFolderId] = useRecoilState(openFolderState);
    const [selectedFolderId] = useRecoilState(selectedFolderIdState);
    const [availableSyncFolders] = useRecoilState(availableSyncFoldersState);
    const [downloadFileId] = useRecoilState(downloadFileIdState);
    const [downloadFolderId] = useRecoilState(downloadFolderIdState);
    const [addSyncFolderStatus, addSyncFolder] = useRecoilState(addSyncFolderState);
    const [removeSyncFolderStatus, removeSyncFolder] = useRecoilState(removeSyncFolderState);
    const setLoadingFolderIds = useSetRecoilState(loadingFolderIdState);

    // change sync directories
    useEffect(() => {
        if (commandSocket.readyState !== commandSocket.OPEN) {
            return
        }

        commandSocket.send(JSON.stringify({ type: "CHANGE_DIR", tree_path: selectedSyncFolder }))
    }, [selectedSyncFolder])

    // open file on selection
    useEffect(() => {
        if (commandSocket.readyState !== commandSocket.OPEN || openFileId === "") {
            return
        }

        commandSocket.send(JSON.stringify({ type: "OPEN_FILE", id: openFileId }))
        setOpenFileId(() => "")
    }, [openFileId, setOpenFileId])

    // show file/folder in finder on selection
    useEffect(() => {
        if (commandSocket.readyState !== commandSocket.OPEN || openFolderId === "") {
            return
        }

        commandSocket.send(JSON.stringify({ type: "SHOW_IN_FINDER", id: openFolderId }))
        setOpenFolderId(() => "")
    }, [openFolderId, setOpenFolderId])


    // sync remote folder on selection
    useEffect(() => {
        if (commandSocket.readyState !== commandSocket.OPEN || selectedFolderId === "") {
            return
        }

        setLoadingFolderIds((oldLoadingFolderIds) => {
            oldLoadingFolderIds.add(selectedFolderId);
            return oldLoadingFolderIds;
        })

        commandSocket.send(JSON.stringify({ type: "SYNC_FOLDER", id: selectedFolderId }))
    }, [selectedFolderId])

    // download remote file on selection
    useEffect(() => {
        if (commandSocket.readyState !== commandSocket.OPEN || downloadFileId === "") {
            return
        }

        commandSocket.send(JSON.stringify({ type: "DOWNLOAD_FILE", id: downloadFileId }))
    }, [downloadFileId])

    // download remote folder on selection
    useEffect(() => {
        if (commandSocket.readyState !== commandSocket.OPEN || downloadFolderId === "") {
            return
        }

        commandSocket.send(JSON.stringify({ type: "DOWNLOAD_FOLDER", id: downloadFolderId }))
    }, [downloadFolderId])

    // open folder dialog to select new sync folder
    useEffect(() => {
        if (commandSocket.readyState !== commandSocket.OPEN || !addSyncFolderStatus) {
            return
        }

        commandSocket.send(JSON.stringify({ type: "ADD_SYNC_FOLDER" }))
        addSyncFolder(false)
    }, [addSyncFolderStatus, addSyncFolder])

    // remove sync folder
    useEffect(() => {
        if (commandSocket.readyState !== commandSocket.OPEN || !removeSyncFolderStatus) {
            return
        }

        console.info("HEREE")
        commandSocket.send(JSON.stringify({ type: "REMOVE_SYNC_FOLDER", folder_path: selectedSyncFolder }))
        removeSyncFolder(false)
    }, [removeSyncFolderStatus, removeSyncFolder])

    return (
        <div className="app">
            <NavBar title="UPLOADER" syncFolders={availableSyncFolders}></NavBar>
            <div className="filetree-container">
                <FileTree></FileTree>
            </div>
        </div>
    );
};

export default FileTreePage;
