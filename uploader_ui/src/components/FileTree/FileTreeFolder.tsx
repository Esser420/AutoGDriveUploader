import React, { MouseEvent, useState, useEffect } from "react";
import {
  FileTreeNodeModel,
  FileTreeModel,
  RemoteFileTreeModel,
} from "../../models/filetree";
import {
  getLocation,
  getBackgroundColor,
  findChildrenWithMap,
} from "../../utils/filetree";
import FileTreeFile from "./FileTreeFile";
import "./FileTree.css";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  nodesState,
  parentToChildrenState,
  gidToNodeState,
  remoteParentToChildrenState,
  selectedNodeState,
  currentRootState,
  selectedFolderIdState,
  loadingFolderIdState,
  downloadFolderIdState,
  openFolderState
} from "../../states/filetree";
import { FileLocation } from "./consts";
import ActionButton from "./ActionButton";

const BASE_GDRIVE_FOLDER_URL = "https://drive.google.com/drive/u/3/folders/"

interface FileTreeProps {
  treeNode: FileTreeNodeModel;
  fullTree: FileTreeModel;
  uploadStatusTree: FileTreeModel; // not really file tree model
  remoteTree: RemoteFileTreeModel;
}

const FileTreeFolder = (props: FileTreeProps) => {
  const [children, setChildren] = useState<FileTreeNodeModel[]>([]);
  const [childrenCount, setChildrenCount] = useState(-1);
  const [currentNodesState, setNodesState] = useRecoilState(nodesState);
  const [selectedNodeId, setSelectedNodeId] = useRecoilState(selectedNodeState);
  const setRootId = useSetRecoilState(currentRootState);
  const setSelectedFolderId = useSetRecoilState(selectedFolderIdState);
  const [loadingFolderIds] = useRecoilState(loadingFolderIdState);
  const [parentToChildren] = useRecoilState(parentToChildrenState);
  const [remoteParentToChildren] = useRecoilState(remoteParentToChildrenState);
  const [gidToNode] = useRecoilState(gidToNodeState);
  const setDownloadFolderId = useSetRecoilState(downloadFolderIdState);
  const openFolder = useSetRecoilState(openFolderState);

  const onClick = (event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNodeId(() => props.treeNode.id)
    setSelectedFolderId(() => props.treeNode.id)
    setNodesState((oldNodesState) => {
      const newNodesState = { ...oldNodesState };
      const newCurrentNodeState = props.treeNode.gid && props.treeNode.gid in newNodesState ? newNodesState[props.treeNode.gid] : { ...oldNodesState[props.treeNode.id] };

      newNodesState[props.treeNode.id] = { open: !newCurrentNodeState.open };
      if (props.treeNode.gid && props.treeNode.gid in newNodesState) {
        newNodesState[props.treeNode.gid] = { open: !newCurrentNodeState.open };
      }
      return newNodesState;
    });
  };

  const onDoubleClick = (event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setRootId(props.treeNode.id);
  }

  const isOpen = currentNodesState[props.treeNode.id]?.open || currentNodesState[props.treeNode.gid || ""]?.open;
  const location = getLocation(props.treeNode);
  const background = getBackgroundColor(location);
  const nodeSelected = props.treeNode.id === selectedNodeId ? "node-selected" : "";
  const imageUrl = isOpen ? "open-folder.png" : "closed-folder.png";

  useEffect(() => {
    (async () => {
      const nextChildren = isOpen
        ? findChildrenWithMap(
          props.treeNode.id,
          props.treeNode.gid || "",
          props.fullTree,
          props.remoteTree,
          parentToChildren,
          remoteParentToChildren,
          gidToNode
        )
        : []
      setChildren(nextChildren)
      isOpen && setChildrenCount(nextChildren.length)
    })()
  }, [isOpen, props, parentToChildren, remoteParentToChildren, gidToNode])

  useEffect(() => {
    const nextChildren = findChildrenWithMap(
      props.treeNode.id,
      props.treeNode.gid || "",
      props.fullTree,
      props.remoteTree,
      parentToChildren,
      remoteParentToChildren,
      gidToNode
    )
    setChildrenCount(nextChildren.length)
  }, [])

  return (
    <div className="node-container folder-container">
      <li
        className={`node folder-node ${background} ${nodeSelected}`}
        onClick={(e) => {
          onClick(e);
        }}
        onDoubleClick={(e) => {
          onDoubleClick(e);
        }}
      >
        <img
          src={process.env.PUBLIC_URL + `/icons/${imageUrl}`}
          alt="open or closed folder icon"
          className="node-icon"
        />
        <div className="node-content">
          <div className="node-content-left">
            <div className="node-content-title-line">
              <div className="node-element node-title">
                <b>{props.treeNode.name}</b>
              </div>
              <div className="node-properties">
                <div className="node-element node-upload-status">
                  <em>{childrenCount > 0 ? `Contains ${childrenCount} children` : 'Folder is empty'}</em>
                </div>
              </div>
            </div>
            <div className="node-content-action-line">
              {location === FileLocation.OnlyRemote &&
                <ActionButton text="DOWNLOAD" callback={() => { setDownloadFolderId(props.treeNode.gid!) }}></ActionButton>}
              {props.treeNode.gid &&
                <ActionButton text="OPEN IN DRIVE" callback={() => { window.open(BASE_GDRIVE_FOLDER_URL + props.treeNode.gid) }}></ActionButton>}
              {(location === FileLocation.OnlyLocal || location === FileLocation.Both) &&
                <ActionButton text="SHOW IN FINDER" callback={() => { openFolder(props.treeNode.id) }}></ActionButton>}
            </div>
          </div>
          <div className="node-content-right">
          </div>
        </div>
      </li>
      <ul className={`non-root-folder ${isOpen && "show"}`}>
        {Object.values(children).map((node) => {
          return node.folder ? (
            <FileTreeFolder
              key={node.id}
              treeNode={node}
              fullTree={props.fullTree}
              remoteTree={props.remoteTree}
              uploadStatusTree={props.uploadStatusTree}
            ></FileTreeFolder>
          ) : (
              <FileTreeFile key={node.id} treeNode={node} uploadStatusTree={props.uploadStatusTree}></FileTreeFile>
            );
        })}
        {loadingFolderIds.has(props.treeNode.id) && <div className={`folder-loader ${isOpen && "show"}`}>
          <li>
            <div className="loader center">
              <i className="fa fa-cog fa-spin" />
            </div>
          </li>
        </div>}
      </ul>
    </div>
  );
};

export default FileTreeFolder;
