const api = 'http://localhost:5678/api/';

async function handleApiRequest(
  endPoint,
  method = 'GET',
  headers = {},
  body = null,
  errorMessage = 'Une erreur est survenue',
  isBodyFormData = false
) {
  try {
    const res = await fetch(`${api}${endPoint}`, {
      method,
      headers,
      body: isBodyFormData ? body : !body ? null : JSON.stringify(body),
    });
    const status = res.status;
    if (status === 204) return { data: null, status };
    const data = await res.json();
    return { data, status };
  } catch (err) {
    console.error(err);
    document.querySelector('#error').innerText = errorMessage;
  }
}

const form = document.querySelector('.login_form');
if (form) {
  const fields = ['E-mail', 'password'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let error = 0;

    fields.forEach((field) => {
      const input = document.querySelector(`#${field}`);
      if (!validateFields(input)) {
        error++;
      }
    });

    if (error === 0) {
      const user = {
        email: document.querySelector('#E-mail').value,
        password: document.querySelector('#password').value,
      };

      handleApiRequest(
        'users/login',
        'POST',
        { 'Content-type': 'application/json' },
        user
      )
        .then((data) => {
          if (data.error) {
            console.error('Error:', data.message);
            document.querySelector('.error-message-all').style.display =
              'block';
            document.querySelector('.error-message-all').innerText =
              'Votre E-mail ou votre Mot de passe est incorrect';
          } else {
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('auth', 1);
            form.submit();
          }
        })
        .catch((data) => {
          console.error('error:', data.message);
        });
    }
  });

  function validateFields(field) {
    if (field.value.trim() === '') {
      setStatus(
        field,
        `${field.previousElementSibling.innerText} ne peut pas être vide`,
        'error'
      );
      return false;
    } else {
      setStatus(field, null, 'success');
      return true;
    }
  }

  function setStatus(field, message, status) {
    const errorMessage = field.nextElementSibling;
    errorMessage.innerText = status === 'success' ? '' : message;
    field.classList.toggle('input-error');
  }
}
