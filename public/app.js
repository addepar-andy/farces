(function() {
  let fire = firebase.database().ref();
  let fireAuth = firebase.auth();
  let currentUser = null;

  function hide(node) {
    node.setAttribute('style', 'display: none');
  }

  function show(node) {
    node.setAttribute('style', '');
  }

  function cloneFromTemplate(cls) {
    return document.getElementById('templates')
      .getElementsByClassName(cls)[0]
      .cloneNode(true);
  }

  function login() {
    let google = new firebase.auth.GoogleAuthProvider();
    google.addScope('https://www.googleapis.com/auth/userinfo.email');
    google.setCustomParameters({
      hd: "addepar.com"
    });
    var SUCCESS = function(result) {
      //TODO: only save email if user doesn't already have email
      fire.child('users')
        .child(result.user.uid)
        .child('email')
        .set(result.user.providerData[0].email.toLowerCase());
    };
    fireAuth.signInWithPopup(google).then(SUCCESS, console.log).catch(function(error) {
      console.log(error);
    });
  }

  function logout() {
    fireAuth.signOut();
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
    hide(document.getElementById('new-person-form'));
  }

  function renderPic(picsNode, picSnapshot) {
    let picNode = cloneFromTemplate('pic');
    picNode.getElementsByTagName('img')[0].src = picSnapshot.val().url;

    picsNode.appendChild(picNode);
  }

  function stopEditing(personNode, editorNode) {
    personNode.removeChild(editorNode);
    show(personNode.getElementsByClassName('edit')[0]);
  }

  function savePerson(personRef, personNode, editorNode, nameField, imageField) {
    let person = {
      name: nameField.value,
      image: imageField.value
    };
    personRef.set(person, function() {
      renderPerson1(personNode, person);
      stopEditing(personNode, editorNode);
    });
  }

  function editPerson(personRef, evt) {
    personRef.once('value', function(personSnapshot) {
      let person = personSnapshot.val();
      let editBtn = evt.target;
      let personNode = editBtn.parentNode;

      let editorNode = cloneFromTemplate('person-editor');

      let nameField = editorNode.getElementsByClassName('name')[0];
      let imageField = editorNode.getElementsByClassName('image')[0];
      let saveBtn = editorNode.getElementsByClassName('save')[0];
      let cancelBtn = editorNode.getElementsByClassName('cancel')[0];

      hide(editBtn);

      nameField.value = person.name;
      imageField.value = person.image;

      saveBtn.addEventListener('click', (evt) =>
          savePerson(personRef, personNode, editorNode, nameField, imageField));
      cancelBtn.addEventListener('click', (evt) => stopEditing(personNode, editorNode));

      personNode.appendChild(editorNode);
    });
  }

  function renderPerson1(personNode, person) {
    personNode.getElementsByTagName('h3')[0].innerText = person.name;
    personNode.getElementsByClassName('primary-pic')[0].src = person.image;
  }

  function renderPerson(personSnapshot) {
    console.log(personSnapshot);
    let person = personSnapshot.val();

    let personNode = cloneFromTemplate('person');
    renderPerson1(personNode, person);

    if (currentUser && currentUser.admin) {
      let editBtn = personNode.getElementsByClassName('edit')[0];
      editBtn.addEventListener('click', (evt) => editPerson(personSnapshot.ref, evt));
    }

    document.getElementById('people').appendChild(personNode);

    let addPicButton = personNode.getElementsByTagName('button')[0];
    let addPicInput = personNode.getElementsByTagName('input')[0];
    addPicButton.addEventListener('click', (evt) =>
      addPic(personSnapshot.ref(), addPicInput.value)
    );

    let toggleNode = document.createElement('button');
    toggleNode.setAttribute('onclick', 'toggleImages(this);');
    toggleNode.textContent = 'toggle'
    personNode.appendChild(toggleNode);

    let picsNode = personNode.getElementsByClassName('pics')[0];
    personSnapshot.ref()
      .child('pics')
      .orderByChild('negvotes')
      .on('child_added', (data) => renderPic(picsNode, data));
  }

  function addPic(personRef, picUrl) {
    personRef.child('pics')
      .push()
      .set({ url: picUrl, negvotes: 0 });
  }

  function renderPeople() {
    fire.child('people').on('child_added', renderPerson);
  }

  function renderAdminStuff() {
    document.getElementById('new-person').setAttribute('style', '');
  }

  function renderLogout() {
    hide(document.getElementById('login'));
    show(document.getElementById('logout'));
  }

  function renderLogin() {
    show(document.getElementById('login'));
    hide(document.getElementById('logout'));
    hide(document.getElementById('new-person'));
    let peopleNode = document.getElementById('people');
    while(peopleNode.firstChild) {
      peopleNode.removeChild(peopleNode.firstChild);
    }
  }

  function init() {
    fireAuth.onAuthStateChanged((auth) => {
      if (auth && auth.uid) {
        renderAdminStuff();
        renderPeople();
        renderLogout();
      } else {
        renderLogin();
      }
    });

    document.getElementById('login').addEventListener('click', login);

    document.getElementById('logout').addEventListener('click', logout);

    document.getElementById('new-person').addEventListener('click', newPerson);

    document.getElementById('create-person').addEventListener('click', addPerson);
  }

  init();
})();

// 1. adding / editing / deleting images as admin
// 2. display images and names
// 3. user added images (make sure its an imgur link)
// 4. display user added images
// 5. upvote user added images
// 6. order user images by upvotes
// 7. nice imgur ui

