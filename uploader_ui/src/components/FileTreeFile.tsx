import React, { useEffect, useState } from "react";
import { FileTreeNodeModel } from "../models/filetree";
import "./FileTree.css";

interface FileTreeProps {
  treeNode: FileTreeNodeModel;
}

const FileTreeFile = (props: FileTreeProps) => {
  const node = props.treeNode;

  const onClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="node-container file-container">
      <li className="node file-node" onClick={(e) => onClick(e)}>
        <div>
          <div className="node-content-title-line">
            <div className="node-element node-title">
              <b>{props.treeNode.name}</b>
            </div>
          </div>
          <div className="node-content-status-line">
            <div className="node-element node-upload-status">
              {"UPLOADED: " + (props.treeNode.gid !== undefined)}
            </div>
            <div className="node-element node-last-modified">
              {"LAST MOD: " + props.treeNode.last_modified}
            </div>
          </div>
        </div>
      </li>
    </div>
  );
};

export default FileTreeFile;