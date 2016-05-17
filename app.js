(function() {
  let fire = new Firebase("https://addefarces.firebaseio.com/");

  function cloneFromTemplate(cls) {
    return document.getElementById('templates')
      .getElementsByClassName(cls)[0]
      .cloneNode(true);
  }

  function afterLogin(error, authData) {
    if (error) {
      alert('could not log you in');
    }
  }

  function login() {
    fire.authWithOAuthPopup("google", afterLogin, {scope: 'email'});
  }

  function newPerson() {
    document.getElementById('new-person-form').setAttribute('style', '');
  }

  function addPerson() {
    let name = document.getElementById('name-field').value;
    let image = document.getElementById('image-field').value;

    newPerson = fire.child('people').push().set({ name: name, image: image });

    document.getElementById('name-field').value = "";
    document.getElementById('image-field').value = "";
    document.getElementById('new-person-form').setAttribute('style', 'display: none');
  }

  function renderPic(picsNode, picSnapshot) {
    let picNode = cloneFromTemplate('pic');
    picNode.getElementsByTagName('img')[0].src = picSnapshot.val().url;

    picsNode.appendChild(picNode);
  }

  function renderPerson(personSnapshot) {
    let person = personSnapshot.val();

    let personNode = cloneFromTemplate('person');
    personNode.getElementsByTagName('h3')[0].innerText = person.name;
    personNode.getElementsByClassName('primary-pic')[0].src = person.image;

    let addPicButton = personNode.getElementsByTagName('button')[0];
    let addPicInput = personNode.getElementsByTagName('input')[0];
    addPicButton.addEventListener('click', (evt) =>
      addPic(personSnapshot.ref(), addPicInput.value)
    );

    //let toggleNode = document.createElement('button');
    //toggleNode.setAttribute('onclick', 'toggleImages(this);');
    //toggleNode.textContent = 'toggle'
    //personNode.appendChild(toggleNode);

    document.getElementById('people').appendChild(personNode);

    let picsNode = personNode.getElementsByClassName('pics')[0];
    personSnapshot.ref()
      .child('pics')
      .orderByChild('negvotes')
      .on('child_added', (data) => renderPic(picsNode, data));

    console.log(person);
  }

  function addPic(personRef, picUrl) {
    personRef.child('pics')
      .push()
      .set({ url: picUrl, negvotes: 0 });
  }

  function renderPeople() {
    fire.child('people').on('child_added', renderPerson);
  }

  function init() {
    renderPeople();

    document.getElementById('login').addEventListener('click', login);

    document.getElementById('new-person').addEventListener('click', newPerson);

    document.getElementById('create-person').addEventListener('click', addPerson);
  }
  init();
})();



