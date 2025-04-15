document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单的默认提交行为

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    // 模拟注册成功，跳转到个人信息提交页面
    setTimeout(() => {
        alert('注册成功！');
        window.location.href = 'index.html';
    }, 1000);
});