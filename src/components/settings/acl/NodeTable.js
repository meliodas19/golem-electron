import React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';

import NodeRow from './NodeRow';
import ConditionalRender from '../../hoc/ConditionalRender';

const NodeTable = ({ aclRestrictedMode = false, list, checkedItems, toggleItems, showBlockNodeModal, isBlockTable = false }) => {
	return (
		<table className="fragment__node-table">
			<thead>
				<tr>
					<th scope="col" width="15%"></th>
					<th scope="col" >Node ID</th>
					<ConditionalRender showIf={isBlockTable}>
						<th scope="col" >Node IP</th>
						<th scope="col" >PORT</th>
					</ConditionalRender>
					<th scope="col" >Node Name</th>
					<th scope="col" width="50px">{aclRestrictedMode ? 'Delete' : 'Unlock'}</th>
				</tr>
			</thead>
			<tbody>
				{map(list, (item, key) => (
					<NodeRow
						item={item}
						key={key.toString()}
						isBlockTable={isBlockTable}
						isChecked={!!checkedItems[item?.node_id]}
						keyItem={key.toString()}
						toggleItems={toggleItems}
						aclRestrictedMode={aclRestrictedMode}
						showBlockNodeModal={showBlockNodeModal}
					/>
				))}
			</tbody>
		</table>
	);
};

NodeTable.displayName = 'NodeTable';

NodeTable.propTypes = {
	list: PropTypes.object.isRequired,
	checkedItems: PropTypes.object.isRequired,
	toggleItems: PropTypes.func.isRequired
};

export default NodeTable;