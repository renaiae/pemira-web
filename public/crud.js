$(document).ready(function(){
    feather.replace();
    $('#tabel_user').DataTable();
    $('#tabel_user').on('click','.delete',function(){
    var nifdelete = $(this).data('id');
    $('#DeleteModal').modal('show');
    $("#hapus_user").click(function(){
        $.ajax({
        url: '/delete',
        type: 'post',
        data: {
            'nif' : nifdelete,
        },
        success: function(response){
            console.log(response);
            document.location.replace("/admin/listuser");
            }
            });
        });
    });
});