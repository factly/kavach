import React from 'react';
import { List, Avatar, Badge, Space, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia } from '../../actions/media';
import deepEqual from 'deep-equal';

function MediaList({ onSelect, selected }) {
  const dispatch = useDispatch();

  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 8,
  });

  const { media, total } = useSelector((state) => {
    const node = state.media.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        media: node.data.map((element) => state.media.details[element]),
        total: node.total,
      };

    return { media: [], total: 0 };
  });

  React.useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters]);

  const fetchMedia = () => {
    dispatch(getMedia(filters));
  };

  return (
    <Space direction={'vertical'}>
      <Input
        placeholder="Search Media"
        onChange={(e) =>
          e.target.value ? setFilters({ ...filters, q: e.target.value }) : setFilters(filters)
        }
      />
      <List
        grid={{
          gutter: 16,
          md: 4,
        }}
        pagination={{
          current: filters.page,
          total: total,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) => {
            setFilters({ page: pageNumber, limit: pageSize });
          },
        }}
        dataSource={media}
        renderItem={(item) => (
          <List.Item>
            {selected && item.id === selected.id ? (
              <Badge dot>
                <Avatar
                  onClick={() => onSelect(null)}
                  shape="square"
                  size={174}
                  src={item.url?.proxy}
                />
              </Badge>
            ) : (
              <Avatar
                onClick={() => onSelect(item)}
                shape="square"
                size={174}
                src={item.url?.proxy}
              />
            )}
          </List.Item>
        )}
      />
    </Space>
  );
}

export default MediaList;
