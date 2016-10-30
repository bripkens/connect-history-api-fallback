const xhr = new XMLHttpRequest();
xhr.open('GET', '/users/5.json');
xhr.responseType = 'json';
xhr.setRequestHeader('Accept', 'application/json');
xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    document.getElementById('output').textContent = JSON.stringify(xhr.response, 0, 2);
  }
};
xhr.send();
