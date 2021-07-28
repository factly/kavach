import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader as AntPageHeader } from 'antd';
import routes from '../../config/routes';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { matchPath } from 'react-router';

function PageHeader() {
  const state = useSelector((state) => state);
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const entity = pathSnippets[0];

  const breadcrumbItems = useMemo(() => {
    const urlBreadcrumbItems = pathSnippets.map((empty, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const route = _.find(routes, { path: url });

      if (route) {
        return {
          path: route.path,
          breadcrumbName: route.title,
        };
      } else {
        if (pathSnippets.includes('edit') && !state[entity].loading) {
          const generatedReferenceURL = `/${pathSnippets.slice(0, index - 1).join('/')}`
            .concat('/:id/')
            .concat(pathSnippets.slice(index, index + 2).join('/'));
          let match = matchPath(location.pathname, {
            path: generatedReferenceURL,
            exact: true,
            strict: false,
          });
          if (match) {
            const route = _.find(routes, { path: generatedReferenceURL });
            if (route) {
              const entityId = pathSnippets[index - 1];
              return {
                path: route.path,
                breadcrumbName: state[entity].details[entityId].name,
              };
            }
          }
        } else {
          return null;
        }
      }
    });
    return [
      {
        path: '/',
        breadcrumbName: 'Home',
      },
    ].concat(_.filter(urlBreadcrumbItems));
  }, [pathSnippets]);

  const lastItem = useMemo(() => {
    return (
      _.find(routes, { path: breadcrumbItems[breadcrumbItems.length - 1].path }) || {
        path: '/',
        breadcrumbName: 'Home',
      }
    );
  }, [breadcrumbItems]);

  const itemRender = (route, params, routes, paths) => {
    const last = routes.indexOf(route) === routes.length - 1;
    if (last) {
      return <span>{route.breadcrumbName}</span>;
    }
    return <Link to={route.path}>{route.breadcrumbName}</Link>;
  };

  if (state[entity] && !state[entity].loading)
    return (
      <AntPageHeader
        ghost={false}
        title={lastItem.title}
        breadcrumb={{ itemRender, routes: breadcrumbItems }}
      />
    );
  else {
    return null;
  }
}

export default PageHeader;
