import './DocumentsTab.scss';
import { ChangeEvent, Dispatch, RefObject, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { APIResponse, DocumentsAPI } from '../../../../models/APIModels';
import { LayoutConfigComponentTab, LoaderType } from '../../../../models/AppDashboardModels';
import { GlobalStoreState, globalStore } from '../../../../stores/GlobalStore/GlobalStore';
import { getIcon, notify } from '../../../../utils/globalUtilityMethods';
import CustomTooltip from '../../../shared/CustomTooltip/CustomTooltip';
import LoadingSpinner from '../../../shared/LoadingSpinner/LoadingSpinner';
import { getDocuments, removeDocument, uploadDocument } from '../../../../services/top-right-card-data-service';

function DocumentsTab (props: {
    tab: LayoutConfigComponentTab;
    isMaximized: boolean;
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined;
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader';
}) {
    
    const { siteId } = useParams<{siteId: string}>();

    const [docList, setDocList]: [DocumentsAPI[] | undefined, Dispatch<SetStateAction<DocumentsAPI[] | undefined>>]
    = useState<DocumentsAPI[]>();
    
    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const { dispatch } = globalState;

    const uploadInputRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    useEffect(() => {
        if (!globalState.state.docList || siteId !== globalState.state.docList.siteId) {
            getDocuments(siteId).then((data: APIResponse<DocumentsAPI[]>) => {
                dispatch((prev: GlobalStoreState) => ({
                    ...prev,
                    actions: [
                        { 
                            type: 'docList',
                            data: {
                                siteId: siteId,
                                data: [...data.resultSet]
                            }
                        }
                    ]
                }))
            })
            .catch(err => console.log('Error', err))
        } else {
            setDocList(globalState.state.docList.data)
        }
    }, [dispatch, globalState.state.docList, siteId])

    useEffect(() => {
        if (props.setLoader) {
            if (docList) {
                props.setLoader({showLoader: false})
            } else {
                props.setLoader({
                    showLoader: true,
                    position: props.loaderPosition
                })
            }
        }
    }, [docList, props])

    const onUpload = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const fileName: string = event.target.files?.[0].name ?? '';
        // console.log('event', event.target.files?.[0], fileName)
        setIsUploading(true)

        uploadDocument(siteId, event.target.files?.[0] as File).then((res: APIResponse<DocumentsAPI[] | null>) => {
            // console.log('Upload Success', res);
            setIsUploading(false);
            if (res.message === 'success') {
                notify(
                    dispatch,
                    {
                        show: 'start',
                        type: 'success',
                        message: `${fileName} uploaded successfully.`
                    },
                    [{
                        type: 'docList',
                        data: {
                            siteId: siteId,
                            data: [...res.resultSet!]
                        }
                    }]
                )
            } else {
                notify(
                    dispatch,
                    {
                        show: 'start',
                        type: 'fail',
                        message: res.message.charAt(0).toUpperCase() + res.message.slice(1)
                    }
                )
            }
        })
        .catch(err => {
            console.log('Upload Error', err)
            setIsUploading(false);
            notify(
                dispatch,
                {
                    show: 'start',
                    type: 'fail',
                    message: `${fileName} couldn't be uploaded.`
                }
            )
        })

        if (uploadInputRef.current?.value) {
            (uploadInputRef.current as HTMLInputElement).value = '';
        }

    }, [dispatch, siteId])

    const onFileRemove = useCallback((fileName: string): void => {
        removeDocument(siteId, fileName).then((res: APIResponse<{count: number}>) => {
            if (res.message === 'success') {
                notify(
                    dispatch,
                    {
                        show: 'start',
                        type: 'success',
                        message: `${fileName} removed successfully.`,
                        icon: 'remove'
                    },
                    [{
                        type: 'docList',
                        data: {
                            siteId: siteId,
                            data: [...(docList as DocumentsAPI[])?.filter((doc: DocumentsAPI) => doc.docName !== fileName)]
                        }
                    }]
                )
            } else {
                notify(
                    dispatch,
                    {
                        show: 'start',
                        type: 'fail',
                        message: res.message.charAt(0).toUpperCase() + res.message.slice(1)
                    }
                )
            }
        })
        .catch((err: any) => {
            console.log('Remove Error', err)
            notify(
                dispatch,
                {
                    show: 'start',
                    type: 'fail',
                    message: `${fileName} could not be removed.`
                }
            )
        })
    }, [dispatch, docList, siteId])

    return (
        <div className="doc-list-tab">
            <div>Documents</div>
            
            <input
                ref={uploadInputRef}
                type="file"
                onChange={onUpload}
                style={{display: 'none'}}
            />

            {
                docList ?
                <div className={`doc-list-container app-scroll${props.isMaximized ? ' height-max' : ' height-default'}`}>
                    {
                        docList.length ?
                        docList.map((doc: DocumentsAPI, index: number) => (
                            <div key={`docList-${index}`} className="doc-item">
                                <CustomTooltip title={doc.docName}>
                                    <a href={doc.docUrl} rel="noreferrer" className="doc-link">
                                        {getIcon('pdf')}
                                        <span>{doc.docName}</span>
                                    </a>
                                </CustomTooltip>
                                <CustomTooltip title="Remove Document">
                                    <button
                                        type="button"
                                        className="icon-btn remove-icon"
                                        onClick={() => onFileRemove(doc.docName)}
                                    >
                                        {getIcon('remove')}
                                    </button>
                                </CustomTooltip>
                            </div>
                        ))
                        : <div style={{padding: 10}}>No document available for this Site</div>
                    }
                </div>
                : null
            }

            <button
                type="button"
                className="doc-upload"
                onClick={() => isUploading ? null : uploadInputRef.current?.click()}
                disabled={isUploading}
            >
                {
                    isUploading ?
                    <LoadingSpinner size="small"/> :
                    getIcon('upload')
                }
                <span>Upload</span>
            </button>
        </div>
    );
}

export default DocumentsTab;