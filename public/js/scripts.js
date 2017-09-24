class WUploadClient{
    constructor(){

    }
}

jQuery(document).ready(function($){

    $('#browse-files').on('click', function(e){
        e.preventDefault();

        $('#file-uploader').trigger('click');
    });
    
    var fileQueue = [];

    $('#file-uploader').on('change', function(){

        var files = $(this).get(0).files;

        fileQueue = [];


        if (files.length > 0){
            $('.items').html('');
            for (var i = 0; i < files.length; i++) {
                fileQueue.push(files[i]);

                var html = '<div class="item item-'+i+'"><div class="progress-bar"><div class="inner"></div></div><div class="item-name">'+files[i].name+'</div></div>';
                var $item = $(html).appendTo($('.items'));
            }
            // console.log( formData.getAll('photos'));
        }

    });

    $('form').on('submit', function (e){
        e.preventDefault();
        var processCount = 0;
        for (var i = 0; i < fileQueue.length; i++) {
            
            var formData = new FormData();

            // Add the files to formData object for the data payload
            formData.append('photos', fileQueue[i], fileQueue[i].name);

            var httpRequest = new XMLHttpRequest();
            // httpRequest.setRequestHeader('Content-Type', 'multipart/form-data')
            httpRequest.open('POST', '/upload');

            httpRequest.upload.addEventListener('progress', (function(file, $item) { return function(event) {
                console.log(file, $item);
                if (event.lengthComputable) {
                    // calculate the percentage of upload completed
                    var percentComplete = event.loaded / event.total;
                    percentComplete = parseInt(percentComplete * 100);

                    // update the Bootstrap progress bar with the new percentage
                    // $('.status').text(percentComplete + '%');
                    $item.find('.item-name').html(file.name+': '+percentComplete + '%');
                    $item.find('.progress-bar .inner').width(percentComplete + '%');

                    // once the upload reaches 100%, set the progress bar text to done
                    if (percentComplete === 100) {
                        $item.find('.item-name').html(file.name+': Done');
                    }

                }

            }})(fileQueue[i], $('.items').find('.item-'+i)));

            httpRequest.onload = function(event) {
                console.log('upload successful!\n', event);
            };
                
            httpRequest.send(formData);
            
        }
            
        
    });
});