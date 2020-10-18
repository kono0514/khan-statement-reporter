export default {
  TInput: {
    fixedClasses: 'form-input',
    classes: '',
    variants: {
      danger: 'border-red-300 bg-red-100',
      success: 'border-green-300 bg-green-100'
    }
  },
  TTextarea: {
    fixedClasses: 'form-textarea',
    classes: '',
    variants: {
      danger: 'border-red-300 bg-red-100',
      success: 'border-green-300 bg-green-100'
    }
  },
  TSelect: {
    fixedClasses: 'form-select',
    classes: '',
    variants: {
      danger: 'border-red-300 bg-red-100',
      success: 'border-green-300 bg-green-100'
    }
  },
  TButton: {
    fixedClasses: 'focus:outline-none focus:shadow-outline inline-flex items-center transition ease-in-out duration-150 disabled:opacity-50',
    classes: 'text-white bg-blue-600 hover:bg-blue-500 focus:border-blue-700 active:bg-blue-700 text-sm font-medium border border-transparent px-3 py-1 rounded-md',
    variants: {
      secondary: 'text-gray-800 bg-white hover:text-gray-600 text-sm font-medium border px-3 py-1 rounded-md',
      error: 'text-white bg-red-600 hover:bg-red-500 focus:border-red-700  active:bg-red-700 text-sm font-medium border border-transparent px-3 py-1 rounded-md',
      success: 'text-white bg-green-600 hover:bg-green-500 focus:border-green-700 active:bg-green-700 text-sm font-medium border border-transparent px-3 py-1 rounded-md',
      link: 'text-blue-500 underline hover:bg-blue-100 text-sm font-medium border border-transparent px-3 py-1 rounded-md'
    }
  },
  TInputGroup: {
    fixedClasses: {
      wrapper: 'mb-4',
      label: 'block uppercase tracking-wide text-xs font-bold mb-1 text-gray-700 dark:text-gray-500',
      body: '',
      feedback: 'text-sm',
      description: 'text-sm'
    },
    classes: {
      wrapper: '',
      label: '',
      body: '',
      feedback: 'text-gray-500',
      description: 'text-gray-500'
    },
    variants: {
      danger: {
        label: 'text-red-500',
        feedback: 'text-red-500'
      }
    }
  },
  TToggle: {
    fixedClasses: {
      wrapper: 'relative inline-flex flex-shrink-0 cursor-pointer transition-colors ease-in-out duration-200',
      wrapperChecked: 'relative inline-flex flex-shrink-0 cursor-pointer transition-colors ease-in-out duration-200',
      button: 'inline-block absolute transform translate-x-0 transition ease-in-out duration-200',
      buttonChecked: 'inline-block absolute transform translate-x-full transition ease-in-out duration-200',
      checkedPlaceholder: 'inline-block',
      uncheckedPlaceholder: 'inline-block'
    },
    classes: {
      wrapper: 'bg-gray-200 focus:outline-none focus:shadow-outline rounded-full border-2 border-transparent',
      wrapperChecked: 'bg-blue-500 focus:outline-none focus:shadow-outline rounded-full border-2 border-transparent',
      button: 'h-5 w-5 rounded-full bg-white shadow  flex items-center justify-center text-gray-400 text-xs',
      buttonChecked: 'h-5 w-5 rounded-full bg-white shadow  flex items-center justify-center text-blue-500 text-xs',
      checkedPlaceholder: 'rounded-full w-5 h-5 flex items-center justify-center text-gray-500 text-xs',
      uncheckedPlaceholder: 'rounded-full w-5 h-5 flex items-center justify-center text-gray-500 text-xs'
    },
    variants: {
      danger: {
        wrapperChecked: 'bg-red-500 focus:outline-none focus:shadow-outline rounded-full border-2 border-transparent'
      },
      success: {
        wrapperChecked: 'bg-green-500 focus:outline-none focus:shadow-outline rounded-full border-2 border-transparent'
      },
      box: {
        wrapper: 'bg-gray-200 focus:outline-none focus:shadow-outline rounded-sm border-2 border-transparent',
        wrapperChecked: 'bg-blue-500 focus:outline-none focus:shadow-outline rounded-sm border-2 border-transparent',
        button: 'h-6 w-6 rounded-sm bg-white shadow  flex items-center justify-center text-gray-400 text-xs',
        buttonChecked: 'h-6 w-6 rounded-sm bg-white shadow  flex items-center justify-center text-blue-500 text-xs',
        checkedPlaceholder: 'rounded-sm h-6 w-6 flex items-center justify-center text-gray-500 text-xs',
        uncheckedPlaceholder: 'rounded-sm h-6 w-6 flex items-center justify-center text-gray-500 text-xs'
      }
    }
  },
  TAlert: {
    fixedClasses: {
      wrapper: 'rounded px-3 py-2 flex text-sm border-l-4',
      body: 'flex-grow',
      close: 'ml-4 rounded',
      closeIcon: 'h-5 w-5 fill-current'
    },
    classes: {
      wrapper: 'bg-blue-100 border-blue-500 dark:bg-blue-400 dark:border-blue-700',
      body: 'text-blue-700 dark:text-blue-800',
      close: 'text-blue-700 hover:text-blue-500 hover:bg-blue-200 dark:text-blue-800',
      closeIcon: 'h-5 w-5 fill-current'
    },
    variants: {
      danger: {
        wrapper: 'bg-red-100 border-red-500 dark:bg-red-400 dark:border-red-700',
        body: 'text-red-700 dark:text-red-100',
        close: 'text-red-700 hover:text-red-500 hover:bg-red-200 dark:text-red-800'
      },
      success: {
        wrapper: 'bg-green-100 border-green-500 dark:bg-green-400 dark:border-green-700',
        body: 'text-green-700 dark:text-green-900',
        close: 'text-green-700  hover:text-green-500 hover:bg-green-200 dark:text-green-800'
      },
      warning: {
        wrapper: 'bg-yellow-100 border-yellow-500 dark:bg-yellow-400 dark:border-yellow-700',
        body: 'text-yellow-700 dark:text-yellow-800',
        close: 'text-yellow-700 hover:text-yellow-500 hover:bg-yellow-200 dark:text-yellow-800'
      }
    }
  },
  TCard: {
    fixedClasses: {
      wrapper: 'rounded mx-auto shadow border border-solid border-gray-200 dark:bg-gray-800 dark:border-gray-600',
      body: 'px-3 py-2',
      header: 'px-3 py-2 border-b dark:border-gray-600',
      footer: 'px-3 py-2 border-t'
    },
    classes: {
      wrapper: 'bg-white',
      body: '',
      header: '',
      footer: ''
    },
    variants: {
      danger: {
        wrapper: 'bg-red-100 text-red-700',
        header: 'border-red-200 text-red-700',
        footer: 'border-red-200 bg-red-100 text-red-700'
      }
    }
  },
  TModal: {
    fixedClasses: {
      overlay: 'z-40 overflow-auto left-0 top-0 bottom-0 right-0 w-full h-full fixed bg-opacity-50',
      wrapper: 'z-50 relative mx-auto my-0',
      modal: 'bg-white dark:bg-gray-900 shadow overflow-hidden relative',
      body: 'p-4',
      header: 'p-4 border-b text-sm font-semibold uppercase text-gray-700 dark:text-gray-100',
      footer: 'p-2 border-t',
      close: 'absolute right-0 top-0 m-3 text-gray-700 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-500',
      closeIcon: 'h-5 w-5 fill-current'
    },
    classes: {
      overlay: 'bg-black ',
      wrapper: 'mt-12 max-w-lg',
      modal: '',
      body: '',
      header: '',
      footer: '',
      close: 'text-gray-700 hover:text-gray-600',
      closeIcon: ''
    },
    variants: {
      danger: {
        overlay: 'bg-red-500',
        wrapper: 'mt-12 max-w-lg',
        header: 'border-red-100 text-red-700',
        footer: 'border-red-100 bg-red-100',
        close: 'text-red-700 hover:text-red-600'
      },
      fullscreen: {
        overlay: '',
        body: 'overflow-y-auto flex-1',
        wrapper: 'm-0 w-full h-full',
        modal: 'w-full h-full flex flex-col',
      }
    }
  },
  TDropdown: {
    classes: {
      button: 'px-4 py-2 flex items-center border rounded hover:text-gray-700',
      wrapper: 'inline-flex flex-col',
      dropdownWrapper: 'relative z-10',
      dropdown: 'origin-top-right absolute right-0 w-48 rounded-md shadow-lg bg-white',
      enterClass: '',
      enterActiveClass: 'transition ease-out duration-100 transform opacity-0 scale-95',
      enterToClass: 'transform opacity-100 scale-100',
      leaveClass: 'transition ease-in transform opacity-100 scale-100',
      leaveActiveClass: '',
      leaveToClass: 'transform opacity-0 scale-95 duration-75'
    },
    variants: {
      danger: {
        button: 'px-4 py-2 flex items-center border rounded bg-red-100 border-red-600 text-red-500 hover:text-red-400',
        dropdown: 'origin-top-right absolute right-0 w-56 rounded-md shadow bg-red-100'
      }
    }
  }
}
