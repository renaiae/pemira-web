var express = require("express");
var path = require("path");
var mysql = require('mysql');
var bodyParser = require('body-parser');
var session = require('express-session');
const { request } = require("http");
var _ = require("underscore");
var app = express();


// Database
var conn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'pemira_hmgp_2021'
  });

conn.connect((err) => {
if (err) {
    console.log('error connecting: ' + err.stack);
    return;
}
console.log('Terhubung ke MySQL');
});


//set engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//session
app.use(session({
  secret: 'pemirahmgpantimatigaya',
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: {
      expires: 15 * 60 * 1000
  }
}));


// FORM POST -------------------------------------------------------
// LOGIN
app.post('/login', function(request, response) {
  var login_nif = request.body.nif;
  var login_pass = request.body.pass;
  if (login_nif && login_pass) {
      conn.query('SELECT * FROM user WHERE nif = ? AND pass = ?', [login_nif, login_pass], function(error, results, fields) {
          if (results.length > 0 && login_nif == "00000") {
              request.session.loggedin = true;
              request.session.user = "00000";
              response.send('admin');
              response.end();
          }
          else if (results.length > 0 && login_nif != "00000") {
              request.session.loggedin = true;
              request.session.user = login_nif;
              response.send('user');
              response.end();
          }
        //   else if (results.length > 0 && login_nif != "00000" && results[0]["status"] == "online") {
        //       response.send('Status ' + login_nif + ' sedang online. Hubungi panitia jika ada kendala.' );
        //   }  
          else {
              response.send('NIF atau password salah');
              response.end();
          }           
      });
  }
  else {
      response.send('Isian masih kosong');
      response.end();
  }
});


// DAFTAR
app.post('/validasinif', function(request, response) {
  var daftar_nif = request.body.daftar_nif;
  if (request.body.check_nif) {
      conn.query('SELECT * FROM mahasiswa_aktif WHERE nif = ?', [daftar_nif], function(error, results, fields) {
          if (results.length > 0) {
              conn.query('SELECT * FROM user WHERE nif = ?', [daftar_nif], function(error, results, fields) {
                  if (results.length > 0) {
                    response.send('NIF telah terdaftar. Hubungi panitia jika ada kendala.');
                    response.end();      
                  }
                  else {
                    response.send("NIF belum terdaftar.");
                    response.end();    
                  }
              });
          }
          else {
              response.send('NIF yang dimasukkan tidak terdaftar sebagai NIF mahasiswa aktif Pembangunan Wilayah.');
              response.end();
          }           
      });
  }
  else{
      response.send('Terjadi error saat pengecekan NIF. Harap Hubungi Panitia.');
      response.end();
  }
});

app.post('/daftar', function(request, response) {
    var daftar_nif = request.body.daftar_nif;
    var daftar_nama = request.body.daftar_nama;
    var daftar_angkatan = request.body.daftar_angkatan;
    var daftar_password = request.body.daftar_password;
    var ip = (request.headers['x-forwarded-for'] || request.socket.remoteAddress || '').split(',')[0].trim();
    if (request.body.check_daftar) {
        var sql = "INSERT INTO user (ip, nama, angkatan, nif, pass, status) VALUES (?, ?, ?, ?, ?, ?)";
        conn.query(sql, [ip, daftar_nama, daftar_angkatan, daftar_nif, daftar_password, "user"], function (err, result) {
            if (err) throw err;
            response.send("User dengan NIF " + daftar_nif + " berhasil terdaftar.");
            response.end();
        });
    }
    else {
        response.send('Terjadi error saat proses pendaftaran. Harap Hubungi Panitia.');
        response.end();
    }
});




// VOTE
app.post('/vote', function(request, response) {
    var pilihan = request.body.pilihan;
    if (pilihan && request.session.loggedin && request.session.user) {
        conn.query("UPDATE user SET pilihan = ?, waktu_vote = ? WHERE nif = ?", [pilihan, Date(), request.session.user], function(error, results, fields) {
            if (error) throw error;
            console.log(request.session.user + " telah memilih " + pilihan + ".");
            response.send(request.session.user + " telah memilih " + pilihan + ".");
            response.end();
        });
    }
    else if (pilihan && !request.session.loggedin && !request.session.user) {
        console.log('Session expired');
        response.send('Session expired. Harap login kembali.');
        response.end();
    }
    else {
        console.log('proses vote gagal');
        response.send('proses vote gagal');
        response.end();
    }
});

// delete acc
app.post('/delete', function(request, response) {
    if (request.body.nif) {
        var sql = "DELETE FROM user WHERE nif= ?";
        conn.query(sql, [request.body.nif], function (err, results) {
            if (err) throw err;
            response.send("User dengan NIF " + request.body.nif + " berhasil dihapus.");
            response.end();
        });
    }
    else {
        response.send('Terjadi error saat proses delete. Harap Hubungi Panitia.');
        response.end();
    }
});


// logout
app.post('/logout', function(request, response) {
    var status_logout = request.body.logout;
    if (status_logout) {
        request.session.destroy();
        response.send('Berhasil logout');
    }
    else {
        response.send(request.session.user + ' gagal untuk logout');
        response.end();
    }
});

// -------------------------------------------------------------------------------

// Routing  
var public = __dirname + "/public/";

app.use("/", express.static(public));

app.get('/',(request, response) => {
    if (request.session.loggedin && request.session.user != "00000") {
        response.redirect('/vote');
      } 
    else if (request.session.loggedin && request.session.user == "00000") {
        response.redirect('/admin');
      } 
    else {
        response.render('main');
      }
});

////
app.get('/admin', function(request, response) {
  if (request.session.loggedin && request.session.user == "00000") {
    // // punya akun belum vote
    // var jml_akunbelumvote;
    // conn.query("SELECT mahasiswa_aktif.angkatan, mahasiswa_aktif.niu, mahasiswa_aktif.nif, mahasiswa_aktif.nama, user.waktu_vote FROM mahasiswa_aktif INNER JOIN user ON mahasiswa_aktif.nif=user.nif WHERE user.waktu_vote = ''", function(error, results, fields) {
    //     jml_akunbelumvote = results.length;
    // });
    // response.render('admin', {jml_akunbelumvote:jml_akunbelumvote});
    // console.log(jml_akunbelumvote);
    conn.query("SELECT * FROM user INNER JOIN mahasiswa_aktif ON user.nif = mahasiswa_aktif.nif WHERE user.pilihan != '' AND user.waktu_vote != ''", function(error, results, fields){
        var jumlah_1 = _.where(results, {pilihan: "1 - M. Zaky Alfarizi"});
        var jumlah_2 = _.where(results, {pilihan: "2 - Mayselina Candra Rahman Matoka"});
        var jumlah_3 = _.where(results, {pilihan: "3 - Kunastya Mulya Pinta Ramadhan"});
        response.render('admin', {results:results, jumlah_1:jumlah_1.length, jumlah_2:jumlah_2.length, jumlah_3:jumlah_3.length});
    })
  } 
  else {
    response.redirect('/');
  }
});

app.get('/admin/listuser', function(request, response) {
    if (request.session.loggedin && request.session.user == "00000") {
      conn.query("SELECT mahasiswa_aktif.angkatan, mahasiswa_aktif.nama namaa, user.nama namau, user.nif, user.pass, user.waktu_vote, user.ip FROM user INNER JOIN mahasiswa_aktif ON user.nif = mahasiswa_aktif.nif WHERE status = 'user'", function(error, results, fields){
          response.render('admin_listuser', {results:results});
      })
    } 
    else {
      response.redirect('/');
    }
  });

app.get('/admin/listaktif', function(request, response) {
if (request.session.loggedin && request.session.user == "00000") {
    conn.query("SELECT * FROM mahasiswa_aktif WHERE nif NOT IN ( SELECT nif FROM user WHERE status = 'user' )", function(error, results, fields){
        response.render('admin_listaktif', {results:results});
    })
} 
else {
    response.redirect('/');
}
});

app.get('/admin/listblmvote', function(request, response) {
    if (request.session.loggedin && request.session.user == "00000") {
        conn.query("SELECT * FROM user INNER JOIN mahasiswa_aktif ON user.nif = mahasiswa_aktif.nif WHERE pilihan = '' AND status = 'user'", function(error, results, fields){
            response.render('admin_listblmvote', {results:results});
        })
    } 
    else {
        response.redirect('/');
    }
});
/////

app.get("/vote", function(request, response) {
    if (request.session.loggedin && request.session.user != "00000") {
        conn.query("SELECT * FROM user WHERE nif = ?", [request.session.user], function(error, results, fields) {
            if (error) throw error;
            if (results[0]["pilihan"] == ""){
                response.render('vote', {status:"",nif:request.session.user});
            }
            else {
                response.render('vote', {status:"disabled",nif:request.session.user});
            }
        });
      } 
    else {
        response.redirect('/');
      }
});

app.get('*', function(req, res) {
    res.redirect('/');
});

app.all('/public/*', (req,res, next) => {
    res.redirect('/');
});






// server
app.listen(8080, () => {
    console.log('Server is running at port 8080');
  });