import Swal from 'sweetalert2'

interface alertProps {
  title: string
  text: string
  callback?: Function
}

export const showInfoAlert = (title: string, text: string, timer: number) =>
  Swal.fire({
    icon: 'info',
    title,
    text,
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true
  })

export const showWarningAlert = (title: string, text: string, callback: Function) =>
  Swal.fire({
    icon: 'warning',
    title,
    text,
    iconColor: '#F00',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    confirmButtonColor: '#F00',
    cancelButtonText: 'Cancelar',
    cancelButtonColor: '#333333',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      callback()
    }
  })

export const showErrorAlert = (title: string) =>
  Swal.fire({
    icon: 'error',
    title
  })

export const showSuccessAlert = (title: string) =>
  Swal.fire({
    icon: 'success',
    title
  })

export const showConfirmAlert = (title: string, text: string, callback: Function) =>
  Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'green',
    cancelButtonColor: '#1282FB',
    cancelButtonText: 'Regresar',
    confirmButtonText: 'Confirmar',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      callback()
    }
  })
