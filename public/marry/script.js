document.getElementById('infoForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单的默认提交行为

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // 模拟表单提交
    setTimeout(() => {
        document.getElementById('infoForm').style.display = 'none';
        document.getElementById('response-section').style.display = 'block';
        document.getElementById('responseMessage').innerText = `谢谢你, ${name}! 我们已经收到你的信息。我们会尽快通过 ${email} 联系你。`;
    }, 1000);
});

function goBack() {
    document.getElementById('infoForm').style.display = 'block';
    document.getElementById('response-section').style.display = 'none';
    document.getElementById('infoForm').reset();
}