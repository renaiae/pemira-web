function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

$(document).ready(function(){
    // LOGIN
    $(".input_login").click(function(){
        document.getElementsByClassName('needs-validation')[0].classList.remove('was-validated');
    });
    $("#form_login").submit(function(event){
        event.preventDefault();
        var vlogin_nif = $('#login_nif').val();
        var vlogin_pass = $('#login_pass').val();
        var formatnif = /^([0-9]{5})$/gm;
        if (vlogin_nif == "" || vlogin_pass == "") {
            document.getElementById('login_nif').setCustomValidity("invalid");
            document.getElementById('login_pass').setCustomValidity("invalid");
            document.getElementById('invFdb_login_pass').innerHTML="Terdapat isian yang masih kosong";
            document.getElementsByClassName('needs-validation')[0].classList.add('was-validated');    
        }
        else if (!formatnif.exec(vlogin_nif)) {
            document.getElementById('login_nif').setCustomValidity("invalid");
            document.getElementById('login_pass').setCustomValidity("invalid");
            document.getElementById('invFdb_login_pass').innerHTML="Format NIF tidak valid";
            document.getElementsByClassName('needs-validation')[0].classList.add('was-validated');
        }
        else {
            $('#icon_login').removeClass('fa-sign-in-alt');
            $('#icon_login').addClass('fa-spinner');
            $('#icon_login').addClass('fa-pulse');
            $('#tombol_daftar').addClass('disabled');
            $('#tombol_submit_login').prop('disabled', true);
            $.ajax({
            url: '/login',
            type: 'post',
            data: {
                'nif' : escapeHtml(vlogin_nif),
                'pass' : escapeHtml(vlogin_pass),
            },
            success: function(response){
                console.log(response);
                if (response.includes('salah') == true) {
                    $('#icon_login').addClass('fa-sign-in-alt');
                    $('#icon_login').removeClass('fa-spinner');
                    $('#icon_login').removeClass('fa-pulse');
                    $('#tombol_daftar').removeClass('disabled');
                    $('#tombol_submit_login').prop('disabled', false);
                    document.getElementById('login_nif').setCustomValidity("invalid");
                    document.getElementById('login_pass').setCustomValidity("invalid");
                    document.getElementById('invFdb_login_pass').innerHTML="Kombinasi NIF/password salah";
                    document.getElementsByClassName('needs-validation')[0].classList.add('was-validated');
                }
                else if (response.includes('admin') == true) {
                    console.log('Welcome Admin!');
                    document.getElementById('login_pass').setCustomValidity("");
                    document.getElementById('login_nif').setCustomValidity("");
                    document.getElementById('invFdb_login_pass').innerHTML="";
                    document.getElementsByClassName('needs-validation')[0].classList.add('was-validated');
                    setTimeout(function() {
                        window.location.pathname = 'admin';
                    }, 1000);
                }
                else if (response.includes('user') == true) {
                    console.log('Welcome ' + vlogin_nif);
                    document.getElementById('login_pass').setCustomValidity("");
                    document.getElementById('login_nif').setCustomValidity("");
                    document.getElementById('invFdb_login_pass').innerHTML="";
                    document.getElementsByClassName('needs-validation')[0].classList.add('was-validated');
                    setTimeout(function() {
                        window.location.pathname = 'vote';
                    }, 1000);
                }
                else {
                    alert(response);
                }
            }
            });
        }
    });


// DAFTAR
    $(".input_daftar").click(function(){
        document.getElementsByClassName('needs-validation')[1].classList.remove('was-validated');
    });
    //

    $('#daftar_nif').on('input', function() {
        var formatnif = /^([0-9]{5})$/gm;
        if ($('#daftar_nif').val() == "") {
            document.getElementById('daftar_nif').setCustomValidity("invalid");
            document.getElementById('invFdb_daftar_nif').innerHTML="Isian masih kosong.";
        }
        else if (!formatnif.exec($('#daftar_nif').val())) {
            document.getElementById('daftar_nif').setCustomValidity("invalid");
            document.getElementById('invFdb_daftar_nif').innerHTML="Format NIF tidak valid.";
        }
        else {
            $.ajax({
                url: '/validasinif',
                type: 'post',
                data: {
                    'check_nif' : '1',
                    'daftar_nif' : escapeHtml($('#daftar_nif').val()),
                },
                success: function(response){
                    console.log(response);
                    if (response.includes('NIF belum terdaftar.') == true) {
                        document.getElementById('daftar_nif').setCustomValidity("");
                        document.getElementById('invFdb_daftar_nif').innerHTML="";
                    }
                    else {
                        document.getElementById('daftar_nif').setCustomValidity("invalid");
                        document.getElementById('invFdb_daftar_nif').innerHTML=response;
                    }
                }
            });
        }   
    });
    //
    $('#daftar_nama').on('input', function() {
        var formatnama = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
        if ($('#daftar_nama').val() == "") {
            document.getElementById('daftar_nama').setCustomValidity("invalid");
            document.getElementById('invFdb_daftar_nama').innerHTML="Isian masih kosong.";
        }
        else if (!formatnama.exec($('#daftar_nama').val())) {
            document.getElementById('daftar_nama').setCustomValidity("invalid");
            document.getElementById('invFdb_daftar_nama').innerHTML="Format Nama memiliki karakter yang tidak valid.";
        }
        else {
            document.getElementById('daftar_nama').setCustomValidity("");
            document.getElementById('invFdb_daftar_nama').innerHTML=""; 
        }
    });
    //
    $('#daftar_angkatan').on('input', function() {
        if ($('#daftar_angkatan').val() == "") {
            document.getElementById('daftar_angkatan').setCustomValidity("invalid");
            document.getElementById('invFdb_daftar_angkatan').innerHTML="Pilih salah satu.";
        }
        else {
            document.getElementById('daftar_angkatan').setCustomValidity("");
            document.getElementById('invFdb_daftar_angkatan').innerHTML=""; 
        }
    });
    //
    $('#daftar_passw').on('input', function() {
        var formatpassword = /^[A-Za-z0-9]{6,12}$/g;
        if ($('#daftar_passw').val() == "") {
            document.getElementById('daftar_passw').setCustomValidity("invalid");
            document.getElementById('invFdb_daftar_password').innerHTML="Isian masih kosong.";
        }
        else if (!formatpassword.exec($('#daftar_passw').val())) {
            document.getElementById('daftar_passw').setCustomValidity("invalid");
            document.getElementById('invFdb_daftar_password').innerHTML="Password hanya huruf dan angka, terdiri dari 6-12 karakter.";
        }
        else {
            document.getElementById('daftar_passw').setCustomValidity("");
            document.getElementById('invFdb_daftar_password').innerHTML=""; 
        }
    });
    //
    $("#form_daftar").submit(function(event){
        event.preventDefault();
        $('#icon_submitdaftar').removeClass('fa-paper-plane');
        $('#icon_submitdaftar').addClass('fa-spinner');
        $('#icon_submitdaftar').addClass('fa-pulse');
        $('#tombol_submit_daftar').prop('disabled', true);
        document.getElementsByClassName('needs-validation')[1].classList.add('was-validated');
        if ($("#form_daftar")[0].checkValidity() === false) {
            $('#icon_submitdaftar').addClass('fa-paper-plane');
            $('#icon_submitdaftar').removeClass('fa-spinner');
            $('#icon_submitdaftar').removeClass('fa-pulse');
            $('#tombol_submit_daftar').prop('disabled', false);
        }
        else {
            $.ajax({
            url: '/daftar',
            type: 'post',
            data: {
                'check_daftar' : '1',
                'daftar_nif' : $('#daftar_nif').val(),
                'daftar_nama' : $('#daftar_nama').val(),
                'daftar_angkatan' : $('#daftar_angkatan').val(),
                'daftar_password' : $('#daftar_passw').val(),
            },
            success: function(response){
                if (response.includes('berhasil terdaftar.') == true) {
                    document.getElementById('nif_hasildaftar').innerHTML=$('#daftar_nif').val();
                    document.getElementById('pass_hasildaftar').innerHTML=$('#daftar_passw').val();
                    setTimeout(function() {
                        $('#formDaftar').modal('hide');
                        $('#formDaftar').one('hidden.bs.modal',function(){
                        $('#formDaftarNotif').modal('show')
                        });
                    }, 2000);
                }
                else {
                    alert(response);
                }
            }
            });
        }
    });

    // VOTE
    let vote;
    $("#vote_1").click(function(){
        vote = "1 - M. Zaky Alfarizi";
    });
    $("#vote_2").click(function(){
        vote = "2 - Mayselina Candra Rahman Matoka";
    });
    $("#vote_3").click(function(){
        vote = "3 - Kunastya Mulya Pinta Ramadhan";
    });
    $("#konfirmasi_vote").click(function(){
        $('#icon_konfirmasi_vote').removeClass('fa-check');
        $('#icon_konfirmasi_vote').addClass('fa-spinner');
        $('#icon_konfirmasi_vote').addClass('fa-pulse');
        $('#batal_vote').prop('disabled', true);
        $('#konfirmasi_vote').prop('disabled', true);
        $.ajax({
            url: '/vote',
            type: 'post',
            data: {
                'pilihan' : vote,
            },
            success: function(response){
                console.log(response);
                if (response.includes('telah memilih') == true) {
                    setTimeout(function() {
                        document.getElementById('notif_vote_text').innerHTML="Data berhasil direkam. Terima kasih atas partisipasinya.";
                        $('#konfirmasi').modal('hide');
                        $('#konfirmasi').one('hidden.bs.modal',function(){
                        $('#notif_vote').modal('show')
                        });
                    }, 3000);
                }
                else if(response.includes('Session') == true){
                    setTimeout(function() {
                        document.getElementById('notif_vote_text').innerHTML="Session expired. Harap login kembali.";
                        $('#konfirmasi').modal('hide');
                        $('#konfirmasi').one('hidden.bs.modal',function(){
                        $('#notif_vote').modal('show')
                        });
                    }, 3000);
                }
                else {
                    setTimeout(function() {
                        document.getElementById('notif_vote_text').innerHTML="Terjadi kesalahan saat perekaman data. Harap hubungi panitia.";
                        $('#konfirmasi').modal('hide');
                        $('#konfirmasi').one('hidden.bs.modal',function(){
                        $('#notif_vote').modal('show')
                        });
                    }, 3000);
                }
            }
        });
    });

    // LOGOUT
    $("#tombol_logout").click(function(){
        $.ajax({
            url: '/logout',
            type: 'post',
            data: {
                'logout' : '1',
            },
            success: function(response){
                console.log(response);
                document.location.replace("/");
            }
        });
    });
});  

function toTitleCase() {
    var inputlow = $('#daftar_nama').val();
    var kapitalized = 
      inputlow.split(/\s+/).map( s => s.charAt( 0 ).toUpperCase() + s.substring(1).toLowerCase() ).join( " " ).replace( /[<>:"\/\\|?*]+/g, '' );
    $('#daftar_nama').val(kapitalized);
  }
  