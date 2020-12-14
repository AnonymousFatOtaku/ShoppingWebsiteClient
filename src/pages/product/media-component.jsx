import React, {Component} from 'react'

export default class MediaComponent extends Component {
  render() {
    const {block, contentState} = this.props;
    const {foo} = this.props.blockProps;
    const data = contentState.getEntity(block.getEntityAt(0)).getData();
    const emptyHtml = ' ';
    return (
      <div>
        {emptyHtml}
        <img
          src={data.src}
          alt={data.alt || ''}
          style={{height: data.height || 'auto', width: data.width || 'auto'}}
        />
      </div>
    );
  }
}