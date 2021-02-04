import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';
import { getAllUsers } from '../../actions/users';

function Selector({ value, onChange }) {
  const [query, setQuery] = React.useState({
    page: 1,
    limit: 5,
  });
  const dispatch = useDispatch();

  value = [value];

  const { details, loading, selected } = useSelector(({ users, organisations: { selected } }) => {
    let details = [];

    let ids = [];

    ids = users.organisations[selected] ? users.organisations[selected] : [];

    details = value.filter((id) => users.details[id]).map((id) => users.details[id]);

    details = details.concat(
      ids.filter((id) => !value.includes(id)).map((id) => users.details[id]),
    );

    return { details, loading: users.loading, selected };
  });
  console.log({ selected });
  React.useEffect(() => {
    console.log('useEffect');
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchEntities = () => {
    dispatch(getAllUsers());
  };

  return (
    <Select
      allowClear
      bordered
      listHeight={128}
      style={{ width: 120 }}
      loading={loading}
      defaultValue={value}
      placeholder="select user"
      onChange={(values) => onChange(values)}
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      // onPopupScroll={(e) => {
      //   if (e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight) {
      //     if (details.length < total) {
      //       setQuery({ ...query, page: query.page + 1 });
      //     }
      //   }
      // }}
    >
      {details.map((item) => (
        <Select.Option value={item.id} key={'users' + item.id}>
          {item['email']}
        </Select.Option>
      ))}
    </Select>
  );
}

export default Selector;
