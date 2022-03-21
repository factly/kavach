import React from 'react';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import GoogleDrive from '@uppy/google-drive';
import ImageEditor from '@uppy/image-editor';
import Url from '@uppy/url';
import { Dashboard } from '@uppy/react';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/url/dist/style.css';
import '@uppy/image-editor/dist/style.css';
import { checker, getFileName } from '../../utils/sluger';
import { useSelector } from 'react-redux';

function UppyUploader({ onUpload }) {
  const space_slug = useSelector(
    (state) => state.organisations.details[state.organisations.selected]?.slug,
  );
  const uppy = Uppy({
    id: 'uppy-media',
    meta: { type: 'avatar' },
    restrictions: {
      allowedFileTypes: ['image/*'],
    },
    autoProceed: false,
    onBeforeUpload: (files) => {
      const updatedFiles = {};
      Object.keys(files).forEach((fileID) => {
        const name = checker.test(files[fileID].meta.name)
          ? files[fileID].meta.name
          : getFileName(files[fileID].meta.name);
        updatedFiles[fileID] = {
          ...files[fileID],
          file_name: name,
          meta: {
            ...files[fileID].meta,
            name:
              space_slug +
              '/' +
              new Date().getFullYear() +
              '/' +
              new Date().getMonth() +
              '/' +
              Date.now().toString() +
              '_' +
              name,
          },
        };
      });
      return updatedFiles;
    },
  })
    .use(AwsS3, { companionUrl: window.REACT_APP_COMPANION_URL })
    .use(Url, { companionUrl: window.REACT_APP_COMPANION_URL })
    .use(GoogleDrive, { companionUrl: window.REACT_APP_COMPANION_URL })
    .use(ImageEditor, {
      id: 'ImageEditor',

      cropperOptions: {
        viewMode: 1,
        background: true,
        autoCropArea: 1,
        responsive: true,
      },
      companionUrl: window.REACT_APP_COMPANION_URL,
    });

  uppy.on('complete', (result) => {
    const uploadList = result.successful.map((successful) => {
      const upload = {};

      upload['alt_text'] = successful.meta.alt_text
        ? successful.meta.alt_text
        : successful.file_name;
      upload['caption'] = successful.meta.caption;
      upload['description'] = successful.meta.caption;
      upload['dimensions'] = '100x100';
      upload['file_size'] = successful.size;
      upload['name'] = successful.file_name;
      upload['slug'] = successful.file_name;
      upload['title'] = successful.meta.caption ? successful.meta.caption : '';
      upload['type'] = successful.meta.type;
      upload['url'] = {};
      upload['url']['raw'] = successful.uploadURL;
      return upload;
    });

    onUpload(uploadList[0]);
  });
  return (
    <Dashboard
      uppy={uppy}
      plugins={['GoogleDrive', 'Url', 'ImageEditor']}
      metaFields={[
        { id: 'name', name: 'Name', placeholder: 'file name' },
        { id: 'caption', name: 'Caption', placeholder: 'describe what the image is about' },
        { id: 'alt_text', name: 'Alt Text', placeholder: 'describe what the image is content' },
      ]}
    />
  );
}

export default UppyUploader;
