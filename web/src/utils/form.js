export default function createForm(action, method) {
  var form = document.createElement('form');
  form.action = action;
  form.method = method;
  form.style.display = 'none';
  return form;
}
